const express = require('express')
const multer = require('multer')
const router = express.Router({ mergeParams: true })
const projectRoutes = require('./projects')
const authRoutes = require('./auth')
const { PodController } = require('../controller/pod.controller')
const { TestsResultController } = require('../controller/testresult.controller')
const { AnalyticsController } = require('../controller/analytics.controller')
const { SchedulePodController } = require('../controller/schedule-pod.controller')

// Set up Multer for handling file uploads
const storage = multer.memoryStorage() // Store files in memory
const upload = multer({ storage: storage })
router.use('/projects', projectRoutes)
router.use('/auth', authRoutes)
router.post('/pods', PodController.create)
/**
 * @swagger
 * /api/schedulepod:
 *   post:
 *     summary: Schedule a Pod
 *     description: Schedule a Pod based on provided parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project:
 *                 type: string
 *                 description: The project for scheduling the Pod.
 *               environment:
 *                 type: string
 *                 description: The environment for scheduling the Pod.
 *               occurrence:
 *                 type: string
 *                 description: The occurrence for scheduling the Pod.
 *             required:
 *               - project
 *               - environment
 *               - occurrence
 *     responses:
 *       '201':
 *         description: Pod scheduled successfully
 *       '400':
 *         description: Bad request, invalid data provided
 *       '500':
 *         description: Internal server error
 */
router.post('/schedulepod', SchedulePodController.create)
/**
 * @swagger
 * /api/testresult/environment/{env}/format/{format}/project/{project}:
 *   post:
 *     summary: Create a test execution
 *     description: Upload test results for a specific environment, format, and project.
 *     parameters:
 *       - in: path
 *         name: env
 *         required: true
 *         description: The environment for the test result.
 *         schema:
 *           type: string
 *       - in: path
 *         name: format
 *         required: true
 *         description: The format of the test result.
 *         schema:
 *           type: string
 *       - in: path
 *         name: project
 *         required: true
 *         description: The project associated with the test result.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               info:
 *                 type: string  # Assuming 'info' is the name of the text field
 *                 format: binary
 *               results:
 *                 type: string
 *                 format: binary
 *             required:
 *               - info
 *               - results
 *     responses:
 *       '201':
 *         description: Test result created successfully
 *       '400':
 *         description: Bad request, invalid data provided
 *       '500':
 *         description: Internal server error
 */
router.post(
  '/testresult/environment/:env/format/:format/project/:project',
  upload.fields([{ name: 'info' }, { name: 'results' }]),
  TestsResultController.create,
)
/**
 * @swagger
 * /api/analytics:
 *   post:
 *     summary: Send data to analytics
 *     description: Send data using two parameters
 *     requestBody:
 *       description: Test Execution Data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               execId:
 *                 type: string
 *                 description: Test Execution Id.
 *               env:
 *                 type: string
 *                 description: Environment name.
 *     responses:
 *       '201':
 *         description: Send data successfully
 *       '400':
 *         description: Bad request, invalid data provided
 *       '500':
 *         description: Internal server error
 */
router.post('/analytics', AnalyticsController.send)

module.exports = router
