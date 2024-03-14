const XrayGraphqlRequestsService = require('./xray-graphql-requests.service')
const loyalty_cll_testanalytics_1 = require('@sonaemc-customer/loyalty-cll-testanalytics')

class AnalyticsService {
  constructor() {
    this.xrayGraphqlService = new XrayGraphqlRequestsService()
  }

  async dispatchData(testExecId, environment) {
    let testRunsResults = []

    if (testExecId) {
      const total = await this.xrayGraphqlService.getTotalTestRun(testExecId)

      for (let index = 0; index < total; index += 100) {
        let resultTests = await this.xrayGraphqlService.getTestsRuns(
          testExecId,
          index,
        )
        testRunsResults.push(...resultTests)
      }

      if (testRunsResults && testRunsResults.length > 0) {
        const testExeckey = testRunsResults[0].testExecution.jira.key
        const analytics = new loyalty_cll_testanalytics_1.Analytics()
        const res = await analytics.sendJira(
          testRunsResults,
          testExeckey,
          environment,
        )
      }
    }

    return { status: true, message: 'Data sent successfully.' }
  }
}

module.exports = {
  AnalyticsService,
}
