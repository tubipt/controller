const express = require('express')
const router = express.Router({ mergeParams: true })
const environmentsRoutes = require('./environments')
const { ProjectController } = require('../../controller/project.controller')

router.get('/', ProjectController.findAll)

router.use('/:project/environments', environmentsRoutes)

module.exports = router
