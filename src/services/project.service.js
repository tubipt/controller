const { ProjectRepository } = require('../repository/projects.repo')
const XrayGraphqlRequestsService = require('./xray-graphql-requests.service')
class ProjectService {
  constructor() {
    this.xrayGraphqlService = new XrayGraphqlRequestsService()
  }

  async findAll() {
    var projects = await ProjectRepository.getProjects()
    await this.getProjectsEnvironments(projects)
    return projects
  }

  async getProjectsEnvironments(projects) {
    await Promise.all(
      projects.map(async (project) => {
        project.environments =
          await this.xrayGraphqlService.getProjectEnvironments(
            project.tag.toUpperCase(),
          ) //request here
      }),
    )
  }
}

module.exports = {
  ProjectService,
}
