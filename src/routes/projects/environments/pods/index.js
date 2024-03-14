const express = require('express')
const router = express.Router({ mergeParams: true })
const { PodController } = require('../../../../controller/pod.controller')

router.get('/pods', PodController.findAll)
router.get('/pods/:name/:uid', PodController.getPodStatus)
router.delete('/pod/:name/:uid', PodController.destroy)

router.get('/pods/:name/:uid/log', PodController.watchLog)

module.exports = router
