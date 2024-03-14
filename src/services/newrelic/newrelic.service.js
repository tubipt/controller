const axios = require('axios')
const fns = require('date-fns')

class NewRelicService {
  constructor() {
    this.baseURL = process.env.NEWRELIC_BASE_URL
    this.apiKey = process.env.APIKEY
    this.lac = process.env.LAC
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
  }

  async logData(data) {
    var reqData = {
      timestamp: Date.now(),
      logtype: 'custom',
      application: 'automation-test',
      LAC: this.lac,
    }
    Object.assign(reqData, data)
    var res = await axios.post(`${this.baseURL}`, reqData, {
      headers: {
        'Api-Key': this.apiKey,
      },
    })
  }
}

module.exports = {
  NewRelicService,
}
