const passportSaml = require('passport-saml')
const { KeyVaultStrategy } = require('./keyvault.strategy')

class SamlStrategy {
  async strategy() {
    const certificate = await new KeyVaultStrategy().findCertificate(
      process.env.CERT_NAME,
    )
    // SAML strategy for passport -- Single IPD
    const strategy = new passportSaml.Strategy(
      {
        entryPoint: process.env.METADATA,
        issuer: 'passport-saml',
        callbackUrl: '/auth/assertion',
        cert: certificate,
      },
      (profile, done) => done(null, profile),
    )

    return strategy
  }
}

module.exports = {
  SamlStrategy,
}
