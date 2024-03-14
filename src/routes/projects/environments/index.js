const express = require('express')
const router = express.Router({ mergeParams: true })
const podRoutes = require('./pods')

router.use('/:environment/tags/:testTags', podRoutes)
router.use('/:environment', podRoutes)

module.exports = router
