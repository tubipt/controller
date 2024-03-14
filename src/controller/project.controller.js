const { ProjectService } = require('../services/project.service')
class ProjectController {
  static async findAll(req, res, next) {
    try {
      const result = await new ProjectService().findAll()
      res.status(200).json(result)
    } catch (error) {
      res.status(501).send(error.message);
    }
  }
}

module.exports = {
  ProjectController,
}
