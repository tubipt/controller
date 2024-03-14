const { DefaultAzureCredential } = require('@azure/identity')
const { SecretClient } = require('@azure/keyvault-secrets')
const { CertificateClient } = require('@azure/keyvault-certificates')

class KeyVaultStrategy {
  async findSecret(secretName) {
    const client = await this.#secretClient()
    return client
      .getSecret(secretName)
      .then((result) => result.value)
      .catch((err) => {
        throw err
      })
  }
  async findCertificate(certificateName) {
    const client = await this.#certificateClient()
    return client
      .getCertificate(certificateName)
      .then((result) => result.value)
      .catch((err) => {
        throw err
      })
  }

  async #secretClient() {
    const credential = new DefaultAzureCredential()
    const url = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`
    return await new SecretClient(url, credential)
  }

  async #certificateClient() {
    const credential = new DefaultAzureCredential()
    const url = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`
    return await new CertificateClient(url, credential)
  }
}

module.exports = {
  KeyVaultStrategy,
}
