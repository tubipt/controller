const { ProjectService } = require('../project.service')

describe('Verify ProjectService,', () => {
  let projectService

  beforeEach(() => {
    projectService = new ProjectService()
  })

  describe('when findAll is used,', () => {
    it('must return a list of all projects.', async () => {
      const result = await projectService.findAll()
      expect(result).not.toBe(undefined)
    })

    it('must return error.', async () => {
      projectService = { findAll: jest.fn().mockRejectedValue('Error') }

      try {
        await projectService.findAll()
      } catch (error) {
        expect(error).toBe('Error')
      }
    })
  })
})
