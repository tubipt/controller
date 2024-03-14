const { SchedulePodService } = require('../services/schedule-pod.services')

class SchedulePodController {
  static async create(req, res, next) {
    try {
      const { project, environment, occurrence } = req.body
      const result = await new SchedulePodService().create(
        project,
        environment,
        occurrence
      )

      res.status(201).send(result)
    } catch (error) {
      const {message, statusCode} = error
      const errorMessages = error.body ? error.body.message : "Internal Error"
      const logData = {
        message,
        statusCode,
        errorMessages
      }
      res.status(502).send(logData)
    }
  }
}

module.exports = {
  SchedulePodController,
}
