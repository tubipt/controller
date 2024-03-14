const axios = require('axios')

class JsonServerService {
    constructor() {
      this.jsonServerURL = 'http://localhost:3004'
    }
  
    async getPods() {
      const response = await axios.get(`${this.jsonServerURL}/podconfigurations`)
      return response.data
    }
  }
  
  module.exports = JsonServerService