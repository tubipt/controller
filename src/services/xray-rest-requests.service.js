const axios = require('axios')
const { response } = require('express')
const { CancelToken } = axios
const cancelTokenSource = CancelToken.source()

class XrayRestRequestsService {
  constructor() {
    this.xrayURL = process.env.XRAY_BASE_URL
    this.clientId = process.env.CLIENT_ID
    this.clientSecret = process.env.CLIENT_SECRET
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
  }

  async authenticate() {
    var data = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
    }
    var response = await axios.post(`${this.xrayURL}/authenticate`, data)
    return response.data
  }

  async createExecution(
    testResult,
    jsonconfig,
    format,
    project,
    oAuthToken,
    environment,
  ) {
    // Create Blob-like objects
    const blobResult = new Blob([testResult.buffer], {
      type: testResult.mimetype,
    })
    const blobConfig = new Blob([jsonconfig.buffer], {
      type: jsonconfig.mimetype,
    })
    const formData = new FormData()
    formData.append('results', blobResult, testResult.originalname)
    formData.append('info', blobConfig, jsonconfig.originalname)
    const response = await axios
      .post(
        `${this.xrayURL}/import/execution/${format}/multipart?projectKey=${project}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${oAuthToken}`,
          },
          cancelToken: cancelTokenSource.token,
        },
      )
      .then((response) => {
        return response.data
      })
    return response
  }
}

module.exports = XrayRestRequestsService
