const isUtf8 = require('is-utf8')

const isUtf8Valid = (content) => {
  try {
    return isUtf8(content.buffer)
  } catch (error) {
    throw new Error(`Error reading file: ${error}`)
  }
}

module.exports = {
  isUtf8Valid,
}
