const debug = require('debug')
const path = require('path')
const opn = require('opn');
const createError = require('http-errors')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const swaggerDefinition = require('./swaggerDefinition')

BigInt.prototype.toJSON = function () {
  return this.toString()
}
const dotenv = require('dotenv').config({
  path: path.join(
    __dirname,
    `./environments/.env${
      process.env.NODE_ENV ? '.' + process.env.NODE_ENV : ''
    }`,
  ),
})
require('newrelic')
if (dotenv.error) {
  console.error(dotenv.error)
}

// App
const express = require('express')
const app = express()
app.use(express.json())
module.exports = app

const passport = require('passport')

app.use(
  express.urlencoded({
    extended: true,
  }),
)

const routes = require('./src/routes')

//Put your angular dist folder here
app.use(express.static('dist/automation-tests'))

app.use((req, res, next) => {
  debug(req.method + ' ' + req.url)
  next()
})

app.use('/api', routes)

// server settings
const serverPort = process.env.PORT || 3000

const isDevelopment = process.env.NODE_ENV === 'development';

// Swagger setup
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Specify the path to your API routes
}
const specs = swaggerJsdoc(options)

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.json({
    error: {
      message: err.message,
      stack: req.app.get('env') === 'development' ? err.stack : undefined,
    },
  })
})

app.use(passport.initialize())
app.use(passport.session())

const server = app.listen(serverPort, async () => {
  const host = server.address().address
  const port = server.address().port

  console.log('App listening at http://%s:%s', host, port)
  if (isDevelopment){
    // Open the Swagger documentation in the default web browser
    opn(`http://localhost:${port}/api-docs`)
  }; 
})
