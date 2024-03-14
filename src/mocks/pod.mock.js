class PodMock {
  successCreate() {
    return {
      name: '',
      lable: '',
      cores: '*',
      memory: '*',
      terminal: '/projects/1/environments/2/pods/testpod1/log',
    }
  }

  findAll() {
    return [
      {
        name: '',
        lable: '',
        cores: '*',
        memory: '*',
        terminal: '/projects/1/environments/2/pods/testpod1/log',
      },
      {
        name: '',
        lable: '',
        cores: '*',
        memory: '*',
        terminal: '/projects/1/environments/2/pods/testpod2/log',
      },
      {
        name: '',
        lable: '',
        cores: '*',
        memory: '*',
        terminal: '/projects/1/environments/2/pods/testpod3/log',
      },
      {
        name: '',
        lable: '',
        cores: '*',
        memory: '*',
        terminal: '/projects/1/environments/2/pods/testpod4/log',
      },
    ]
  }
}

module.exports = {
  PodMock,
}
