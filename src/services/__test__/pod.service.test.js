const { PodService } = require('../pods.services')
describe('Verify PodService,', () => {
  let podService

  beforeEach(() => {
    podService = new PodService()
  })

  describe('when findAll is used,', () => {
    it('must return a list of all pods of a project and environment.', async () => {
      const result = await podService.findAll(1, 2)
      expect(result).not.toBe(undefined)
    })

    it('must return error.', async () => {
      podService = { findAll: jest.fn().mockRejectedValue('Error') }

      try {
        await podService.findAll(1, 2)
      } catch (error) {
        expect(error).toBe('Error')
      }
    })
  })

  describe('when create is used,', () => {
    it('must return pods of a project and environment.', async () => {
      const result = await podService.create(1, 2)
      expect(result).not.toBe(undefined)
    })

    it('must return error.', async () => {
      podService = { create: jest.fn().mockRejectedValue('Error') }

      try {
        await podService.create(1, 2)
      } catch (error) {
        expect(error).toBe('Error')
      }
    })
  })

  describe('when destroy is used,', () => {
    it('must destroy pod of a project and environment.', async () => {
      const result = await podService.destroy(1, 2, 'test')
      expect(result).toBe(undefined)
    })

    it('must return error.', async () => {
      podService = { destroy: jest.fn().mockRejectedValue('Error') }

      try {
        await podService.destroy(1, 2, 'test')
      } catch (error) {
        expect(error).toBe('Error')
      }
    })
  })
})
