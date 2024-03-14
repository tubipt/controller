class AuthController {
  static async signIn(req, res, next) {
    try {
      res.status(200).send('sign-in feito')
    } catch (error) {
      console.error('AuthController.signIn ', error)
    }
  }
  static async assertion(req, res, next) {
    try {
      res.status(200).send('assertion feito')
    } catch (error) {
      console.error('AuthController.assertion ', error)
    }
  }
  static async logout(req, res, next) {
    try {
      res.status(200).send('logout feito')
    } catch (error) {
      console.error('AuthController.logout ', error)
    }
  }

  static async loggedout(req, res, next) {
    try {
      res.status(200).send('loggedout feito')
    } catch (error) {
      console.error('AuthController.loggedout ', error)
    }
  }
}

module.exports = {
  AuthController,
}
