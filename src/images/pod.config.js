const JsonServerService = require("../services/json-server.service")
const { scheduleJob } = require("./schedule-pod.config")

const job = (image) => {
  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: `#replace#`,
      namespace: 'automationtest-ns',
    },
    spec: {
      backoffLimit: 0,
      ttlSecondsAfterFinished: 0,
      template: {
        spec: {
          containers: [
            {
              name: '#replace#',
              image: image,
              readinessProbe: null,
              command: ['/bin/sh', '-c'],
              args: [
                "Xvfb :99 -screen 0 #replace_ratio#x24 -ac -fbdir /dev/shm -nolisten tcp & export XVFB_PID=$! & trap 'kill $XVFB_PID' SIGTERM & npm run test -- --env=#replace-env# #replace-tags# #replace-commands#",
              ],
              env: [],
              volumeMounts: [
                {
                  mountPath: '/dev/shm',
                  name: 'dshm',
                },
              ],
              ports: [
                {
                  containerPort: 3000,
                },
              ],
              livenessProbe: null,
            },
          ],
          restartPolicy: 'Never',
          volumes: [
            {
              name: 'dshm',
              emptyDir: {
                medium: 'Memory',
              },
            },
          ],
          dnsConfig: { // Adicionando a configuração de DNS aqui
          
            searches: ['mch.moc.sgps','promoccapipp.azurewebsites.net'] // Sufixos de pesquisa DNS
          }
        },
      },
    },
  }
}

class PodConfiguration {
  name = ''
  environments = []
  image
  tag
  serviceAccountName

  getPodConfiguration(imageTag) {
    this.image = imageTag ? this.image + imageTag : this.image + 'latest'
    return job(this.image)
  }

  getSchedulePodConfiguration(imageTag) {
    this.image += 'latest'
    return scheduleJob(this.image)
  }

  constructor({ name, environments, image, tag, serviceAccountName }) {
    this.name = name
    this.environments = environments
    this.image = image
    this.tag = tag
    this.serviceAccountName = serviceAccountName
  }
}


class Pod {
  static getPods = async () => {
    try {
      const result = await new JsonServerService().getPods();
      const podConfigurations = result.map(pod => new PodConfiguration(pod));
      return podConfigurations;
    } catch (error) {    
      console.error('Error fetching or processing pods:', error);
      throw error; 
    }
  };
}

module.exports = Pod;
