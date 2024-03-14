const { TestsResultService } = require('../services/tests-result.service')
const { NewRelicService } = require('../services/newrelic/newrelic.service')

class TestsResultController {
  static async create(req, res, next) {
    const { env, format, project } = req.params
    const {
      info: [jsonConfig],
      results: [testResult],
    } = req.files

    try {
      let result = await new TestsResultService().dispatchData(
        testResult,
        jsonConfig,
        env,
        format,
        project,
      )

      if (result && !result.error) res.status(200).json(result)
      else res.status(400).json(result)
    } catch (error) {
      const { response, message } = error
      const errorMessage =
      response && response.data
        ? response.data.errorMessages
          ? response.data.errorMessages
          : response.data.error
          ? response.data.error
          : message
        : message;
      const logData = {
        message: message,
        resMessage: errorMessage,
        environment: env,
        step: 'API Request Status - Automation Manager'
      };
      const logDataNewRelic = {
        ...logData,
        jsonConfigAttachment: jsonConfig.buffer.toString('utf-8'),
        testResultAttachment: testResult.buffer.toString('utf-8')
      };
      new NewRelicService().logData(logDataNewRelic);
      res.status(502).send(logData);
    }
  }
}

module.exports = {
  TestsResultController,
}
