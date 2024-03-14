const k8s = require('@kubernetes/client-node')
const { NewRelicService } = require('../services/newrelic/newrelic.service')
const { Kube8S } = require('../k8s')
const { PodService } = require('./pods.services')
const { PodRepository } = require('../repository/pods.repo')

class SchedulePodService {
  constructor(config = Kube8S.loadKubeconfig()) {
    this.jobClient = config.makeApiClient(k8s.BatchV1Api)
    this.deployClient = config.makeApiClient(k8s.CoreV1Api)
    this.metricsClient = new k8s.Metrics(config)
    this.watchPod = new k8s.Watch(config)
    this.logPod = new k8s.Log(config)
    this.namespace = process.env.namespace
    this.podRepository = new PodRepository()
    this.podSevice = new PodService()
  }


  async create(project, environment, occurrence, user = 'Automation') {
    try {
      let jobName = ``
      const projectConfiguration = await this.podRepository.getDeploymentFile(
        project,
        environment,
      )
      const jobConfiguration =
        projectConfiguration.getSchedulePodConfiguration()

      jobName = `automationtest-${project}-${environment}-noturno`
      jobName = jobName.toLowerCase().replace(/[^a-zA-Z0-9 -]/g, '')
      jobConfiguration.spec.ttlSecondsAfterFinished = +process.env.TTL_SECONDS
      jobConfiguration.metadata.name = jobName
      jobConfiguration.spec.schedule = occurrence
      if (projectConfiguration.serviceAccountName) {
        jobConfiguration.spec.jobTemplate.spec.template.spec.serviceAccountName =
          projectConfiguration.serviceAccountName
      }

      jobConfiguration.spec.jobTemplate.spec.template.spec.containers.map((c) => {
        c.name = jobName
        c.env = [
          {
            name: 'createdby',
            value: user.toLowerCase(),
          },
        ]
        c.args = c.args.map((arg) => {
          arg = arg.replace('#replace-env#', environment.toLowerCase())
          arg = arg.replace('#replace_ratio#', '1600x1200')
          return arg
        })
      })

       jobConfiguration.metadata.annotations = {
        'kubectl.kubernetes.io/last-applied-configuration': JSON.stringify(jobConfiguration)
       }  //JSON.stringify(jobConfiguration)
      
      var job = await this.jobClient.createNamespacedCronJob(
        process.env.namespace,
        jobConfiguration,
      )

      const result = {
        podName: job.body.metadata.name,
        projectTag: project,
        environment,
        uid: job.body.metadata.uid,
        status: '',
        createdBy: user,
        createdAt: job.body.metadata.creationTimestamp,
        resourceVersion: job.body.metadata.resourceVersion,
      }

      return result
    } catch (err) {
      throw err
    } 
  }
}

module.exports = {
  SchedulePodService,
}
