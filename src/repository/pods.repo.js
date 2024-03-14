const Pod = require('../images/pod.config');
class PodRepository {
  async getDeploymentFile(projectTag) {
    //file is currently template
    try {
      const projects = await Pod.getPods()
      const project = projects.find((p) => p.tag === projectTag)

      const result = Object.assign(
        Object.create(Object.getPrototypeOf(project)),
        project,
      )
      return result
    } catch (ex) {
      throw new Error(
        `Project ${projectName} not configured, please setup the file first.`,
      )
      //treat exception, ask how??
    }
  }
}

module.exports = {
  PodRepository,
}
