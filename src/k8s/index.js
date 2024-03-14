const k8s = require('@kubernetes/client-node')
const path = require('path')
const homedir = require('os').homedir()

class Kube8S {
  static loadKubeconfig() {
    const kc = new k8s.KubeConfig()
    if (process.env?.NODE_ENV === 'development') {
      // console.log('[K8S][loadKubeConfig][FromFile][kubeconfig]');
      kc.loadFromFile(path.join(homedir, '.kube', 'config'))
    } else {
      // console.log('[K8S][loadKubeConfig][FromCluster]');
      kc.loadFromCluster()
    }

    return kc
  }
  static login(kc) {
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
    return k8sApi
  }
}

module.exports = {
  Kube8S,
}
