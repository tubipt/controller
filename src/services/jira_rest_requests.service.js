const axios = require('axios')
const { CancelToken } = axios
const cancelTokenSource = CancelToken.source()
const { NewRelicService } = require('../services/newrelic/newrelic.service')

class JiraRestRequestService {
  constructor() {
    this.jiraUrl = process.env.JIRA_BASE_URL
    this.jiraPass = process.env.JIRA_PASS
  }

  getAuth() {
    let token = Buffer.from(this.jiraPass, 'utf-8').toString('base64')
    const headers = {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json', // Adjust content type based on your API requirements
    }
    return headers
  }

  async getTransitiosByTest(testRunId) {
    const headers = this.getAuth()
    let response = await axios.get(`${this.jiraUrl}/${testRunId}/transitions`, {
      headers,
      CancelToken: cancelTokenSource.token,
    })
    return response.data
  }

  async forwardTransition(testRunId, transitionId, environment) {
    const headers = this.getAuth()
    const data = {
      transition: {
        id: transitionId,
      },
    }
    let response = await axios
      .post(`${this.jiraUrl}/${testRunId}/transitions`, data, {
        headers,
        CancelToken: cancelTokenSource.token,
      })

    const result = response && response.data !== undefined ? response.data : {}
    return result
  }
}

module.exports = JiraRestRequestService
