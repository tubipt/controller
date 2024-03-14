const axios = require('axios')
const XrayRestRequestsService = require('./xray-rest-requests.service')
const { request, gql, GraphQLClient } = require('graphql-request')

class XrayGraphqlRequestsService {
  constructor() {
    this.xrayURL = process.env.XRAY_BASE_URL
    this.xrayRestService = new XrayRestRequestsService()
  }

  async getGraphAuth() {
    let authToken = await this.xrayRestService.authenticate()
    let graphQLClient = new GraphQLClient(`${this.xrayURL}/graphql`, {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    })
    return graphQLClient
  }

  async getProjectEnvironments(projectIdOrKey) {
    let graphQLClient = await this.getGraphAuth()

    const query = `{getProjectSettings(projectIdOrKey: "${projectIdOrKey}") {testEnvironments}}`
    const { getProjectSettings } = await graphQLClient.request(query)
    return getProjectSettings.testEnvironments
  }

  async getTotalTestRun(executionId) {
    let graphQLClient = await this.getGraphAuth()

    const query = `{getTestRuns(testExecIssueIds: ["${executionId}"], , limit: 100 ) {total}}`
    const { getTestRuns } = await graphQLClient.request(query)
    return getTestRuns.total
  }

  async getTestsRuns(testExecId, startPosition, limit = 100) {
    let graphQLClient = await this.getGraphAuth()

    var query = gql`{
            getTestRuns(testExecIssueIds: ["${testExecId}"], limit: ${limit}, start: ${startPosition}) {
                total
                results {
                    id
                    test {
                        jira(fields: ["key","summary", "status"])
                        issueId
                    }
                    testExecution {
                        jira(fields: ["key","summary"])
                    }
                    status {
                        name
                        description
                    }
                    comment
                    startedOn
                    finishedOn
                    results {
                        name
                        examples {
                            duration
                            status { name }
                            steps { 
                                name
                                status { name }
                            }
                        }
                    }
                }
            }
        }`

    const { getTestRuns } = await graphQLClient.request(query)
    return getTestRuns.results
  }
}

module.exports = XrayGraphqlRequestsService
