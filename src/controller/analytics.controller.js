const { NewRelicService } = require('../services/newrelic/newrelic.service')
const { AnalyticsService } = require('../services/analytics.service')

class AnalyticsController {
  static async send(req, res, next) {
    const { execId, env } = req.body

    try {
      if (!env)
        throw { message: "The required param 'environment' is undefined" }
      if (!execId) throw { message: "The required param 'id' is undefined" }

      let result = await new AnalyticsService().dispatchData(execId, env)

      if (result && !result.error) res.status(200).json(result)
      else res.status(400).json(result)
    } catch (error) {
      const { response, message } = error
      let logData = {
        message: message,
        resMessage: response ? response.data.errorMessages : message,
        environment: env,
        step: 'API Request Status - Automation Manager',
      }
      new NewRelicService().logData(logData)
      res.status(502).send(logData)
    }
  }
}

module.exports = {
  AnalyticsController,
}
