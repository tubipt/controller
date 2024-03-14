const { PodService } = require('../services/pods.services')
class PodController {
  static async create(req, res, next) {
    try {
      const { project, environment, tags, user } = req.body
      const result = await new PodService().create(
        project,
        environment,
        tags,
        user,
      )

      res.status(201).send(result)
    } catch (error) {
      res.status(502).send()
    }
  }

  static async destroy(req, res, next) {
    try {
      const { project, environment, name, uid } = req.params
      await new PodService().destroy(project, environment, name, uid)
      res.status(200).send()
    } catch (error) {
      res.status(502).send()
    }
  }

  static async findAll(req, res, next) {
    try {
      const result = await new PodService().findAll(
        req.params.project,
        req.params.environment,
      )
      res.status(200).send(result)
    } catch (error) {
      throw error
    }
  }

  static async getPodStatus(req, res, next) {
    try {
      const { name, uid } = req.params
      const result = await new PodService().getPodStatus(name, uid)
      res.status(200).send(result)
    } catch (e) {}
  }

  static async watchLog(req, res, next) {
    try {
      const { project, environment, name, uid } = req.params
      await new PodService().watchLog(res, project, environment, name, uid)
    } catch (error) {
      res.status(501).send()
    }
  }

  static async watchPod(req, res, next) {
    try {
      const { project, environment, name, uid } = req.params
      await new PodService().watch(name)
    } catch (error) {
      res.status(501).send()
    }
  }
}

module.exports = {
  PodController,
}
