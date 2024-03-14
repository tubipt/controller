const XrayRestRequestsService = require('./xray-rest-requests.service')
const XrayGraphqlRequestsService = require('./xray-graphql-requests.service')
const loyalty_cll_testanalytics_1 = require('@sonaemc-customer/loyalty-cll-testanalytics')
const { isUtf8Valid } = require('../validators/file-type.validator')
const JiraRestRequestService = require('./jira_rest_requests.service')

class TestsResultService {
  constructor() {
    this.xrayRestService = new XrayRestRequestsService()
    this.xrayGraphqlService = new XrayGraphqlRequestsService()
    this.jiraRestService = new JiraRestRequestService()
  }

  async dispatchData(testResult, jsonconfig, environment, format, project) {
    let oAuth = await this.xrayRestService.authenticate()
    let testRunsResults = []

    if (isUtf8Valid(testResult)) {
      this.testExecution = await this.xrayRestService.createExecution(
        testResult,
        jsonconfig,
        format,
        project,
        oAuth,
        environment,
      )

      if (this.testExecution.key) {
        const total = await this.xrayGraphqlService.getTotalTestRun(
          this.testExecution.id,
        )

        for (let index = 0; index < total; index += 100) {
          let resultTests = await this.xrayGraphqlService.getTestsRuns(
            this.testExecution.id,
            index,
          )
          testRunsResults.push(...resultTests)
        }

        const analytics = new loyalty_cll_testanalytics_1.Analytics()
        const res = await analytics.sendJira(
          testRunsResults,
          this.testExecution.key,
          environment,
        )

        let transitionsSteps
        let doneStep
        for (const testRun of testRunsResults) {
          if (!doneStep) {
            transitionsSteps = await this.jiraRestService.getTransitiosByTest(
              testRun.test.issueId,
            )
            doneStep = transitionsSteps.transitions.find(
              (transition) => transition.to.name == 'Done',
            )
          }

          if (doneStep && testRun.test.jira.status.name != 'Done')
            await this.jiraRestService.forwardTransition(
              testRun.test.issueId,
              doneStep.id,
              environment,
            )
        }
      }
    } else {
      return { error: 'File enconding is not UTF-8' }
    }

    return this.testExecution
  }
}

module.exports = {
  TestsResultService,
}
