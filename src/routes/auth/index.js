const express = require('express')
const router = express.Router({ mergeParams: true })
const { AuthController } = require('../../controller/auth.controller')

router.get('/sign-in', AuthController.signIn)
router.post('/assertion', AuthController.assertion)
router.post('/logout', AuthController.logout)

module.exports = router
