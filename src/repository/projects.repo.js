const Pod = require('../images/pod.config');
class ProjectRepository {
  static async getProjects() {
    try {
      const projects = await Pod.getPods()
      return projects.map((item) => {
        return {
          name: item.name,
          tag: item.tag,
          environments: item.environments,
        }
      })
    } catch (ex) {
      console.err(ex)
      throw ex
    }
  }
}

module.exports = {
  ProjectRepository,
}
