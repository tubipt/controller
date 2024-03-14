const appInsights = require('applicationinsights')

class ApplicationInsights {
  static start() {
    try {
      appInsights.setup().start()
      console.info('Connect with success to application insights!')
    } catch (error) {
      console.error(
        'Instrumentation key for application insights is missing !',
        error,
      )
    }
  }
}

module.exports = {
  ApplicationInsights,
}
