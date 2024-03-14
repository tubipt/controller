const k8s = require('@kubernetes/client-node')
const stream = require('stream')
const { NewRelicService } = require('../services/newrelic/newrelic.service')
const { PodRepository } = require('../repository/pods.repo')
const { Kube8S } = require('../k8s')

class PodService {
  constructor(config = Kube8S.loadKubeconfig()) {
    this.jobClient = config.makeApiClient(k8s.BatchV1Api)
    this.deployClient = config.makeApiClient(k8s.CoreV1Api)
    this.metricsClient = new k8s.Metrics(config)
    this.watchPod = new k8s.Watch(config)
    this.logPod = new k8s.Log(config)
    this.namespace = process.env.namespace
    this.podRepository = new PodRepository()
  }

  async findAll(project, environment) {
    this.ensureProjectEnvironments(project, environment)
    let result = []
    //todo: get job name by its uuid data: Pod.metadata.uuid
    await k8s
      .topPods(this.deployClient, this.metricsClient, process.env.namespace)
      .then((pods) => {
        result = pods.map((pod) => {
          let podEnv = pod.Pod.spec.containers[0].env
          return {
            name: pod.Pod.metadata.name.toLocaleLowerCase(),
            uid: pod.Pod.metadata.labels['controller-uid'],
            labels:
              pod.Pod.metadata.labels == null ? {} : pod.Pod.metadata.labels,
            cores: pod.CPU.CurrentUsage,
            memory: pod.Memory.CurrentUsage,
            status: pod.Pod.status.phase,
            terminal: `/api/log/${process.env.namespace}/${pod.Pod.metadata.name}`,
            createdBy: podEnv
              ? podEnv.find((e) => e.name === 'createdby')?.value
              : '',
            createdAt: pod.Pod.metadata.creationTimestamp,
            commands: podEnv
              ? podEnv.find((e) => e.name === 'commands')?.value
              : '',
          }
        })
      })
      .catch((e) => {
        return
      })
    return result
  }

  async getPodStatus(name, uid) {
    const { Pod } = await this.ensurePod(name, uid)
    if (Pod) {
      return Pod.status.phase
    }
  }

  async create(project, environment, tagsParam, user = '') {
    try {
      let jobName = ``
      this.ensureProjectEnvironments(project, environment)
      const testTags = this.handleTestTags(tagsParam)
      const { testCommands, ratio } = this.handleTestCommands(tagsParam)
      const tagsToPodName = this.handleTagsToPodName(testTags)
      const developmentImage = this.handleDevelopmentImage(tagsParam)
      const projectConfiguration = await this.podRepository.getDeploymentFile(
        project,
        environment,
      )
      const jobConfiguration =
        projectConfiguration.getPodConfiguration(developmentImage)

      jobName = `automationtest-${project}-${environment}${
        tagsToPodName.length > 0 ? tagsToPodName : ''
      }`
      jobName = jobName.toLowerCase().replace(/[^a-zA-Z0-9 -]/g, '')
      jobConfiguration.spec.ttlSecondsAfterFinished = +process.env.TTL_SECONDS
      jobConfiguration.metadata.name = jobName
      if (projectConfiguration.serviceAccountName) {
        jobConfiguration.spec.template.spec.serviceAccountName =
          projectConfiguration.serviceAccountName
      }

      jobConfiguration.spec.template.spec.containers.map((c) => {
        c.name = jobName
        c.env = [
          {
            name: 'createdby',
            value: user.toLowerCase(),
          },
          {
            name: 'tags',
            value: testTags,
          },
          {
            name: 'commands',
            value: testCommands,
          },
        ]
        c.args = c.args.map((arg) => {
          arg = arg.replace('#replace-env#', environment.toLowerCase())
          arg = arg.replace('#replace-tags#', testTags || '')
          arg = arg.replace('#replace-commands#', testCommands || '')
          arg = arg.replace('#replace_ratio#', ratio || '1600x1200')
          return arg
        })
      })
      var job = await this.jobClient.createNamespacedJob(
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
        testTags: testTags,
        createdAt: job.body.metadata.creationTimestamp,
        commands: testCommands,
        resourceVersion: job.body.metadata.resourceVersion,
      }

      return result
    } catch (err) {
      return err
    } finally {
      setTimeout(async () => {
        var pod = await this.ensurePod(
          job.body.metadata.name,
          job.body.metadata.uid,
        )
        if (pod) {
          this.watch(pod.Pod)
        }
      }, 100)
    }
  }

  async destroy(project, environment, name, uid) {
    this.ensureProjectEnvironments(project, environment)
    let podToDestroy = await this.ensurePod(name, uid)
    let jobToDestroy = await this.ensureJob(name)

    if (podToDestroy && jobToDestroy) {
      const deletedJob = await this.jobClient.deleteNamespacedJob(
        jobToDestroy.metadata.name,
        process.env.namespace,
      )
      let deletedPod = await this.deployClient.deleteNamespacedPod(
        podToDestroy.Pod.metadata.name,
        process.env.namespace,
      )
      return { deletedJob, deletedPod }
    }
    throw {
      message: `Neither Pod or Job were found. Please check the data sent and try again.`,
    }
  }

  async watchLog(res, project, environment, name, uid) {
    this.ensureProjectEnvironments(project, environment)
    const pod = await this.ensurePod(name, uid)
    if (pod) {
      const podName = pod.Pod.metadata.name
      const container = pod.Pod.metadata.labels['job-name']
      const logStream = new stream.PassThrough()

      logStream.on('data', (chunk) => {
        res.write(chunk)
      })
      logStream.on('close', () => {
        res.end()
        res.status(200).send()
      })
      let ret
      await this.logPod
        .log(process.env.namespace, podName, container, logStream, {
          follow: true,
          pretty: false,
          timestamps: false,
        })
        .catch((err) => {
          console.error(err)
        })
        .then((req) => {
          ret = req
        })
      return ret //object to abort logging
    } else {
      throw {
        message: `Pod not found. Please check the data sent and try again.`,
      }
    }
  }

  async watch(pod) {
    var req = await this.watchPod.watch(
      `/api/v1/watch/namespaces/${this.namespace}/pods/${pod.metadata.name}`,
      {
        watch: true,
        resourceVersion: pod.metadata.resourceVersion,
        allowWatchBookmarks: true,
      },
      (type, apiObj, watchObj) => {
        if (
          apiObj?.status?.phase == 'Succeeded' ||
          apiObj?.status?.phase == 'Failed'
        ) {
          var data = {
            user: apiObj.spec.containers[0].env.find(
              (e) => e.name === 'createdby',
            ).value,
            pod: apiObj.metadata.name,
            project: apiObj.metadata.labels['job-name'].split('-')[1],
            environment: apiObj.metadata.labels['job-name'].split('-')[2],
            commands: apiObj.spec.containers[0].env.find(
              (e) => e.name === 'commands',
            ).value,
            tags: apiObj.spec.containers[0].env.find((e) => e.name === 'tags')
              .value,
            executionAt: apiObj.metadata.creationTimestamp,
            finishedAt:
              apiObj.status.containerStatuses[0].state.terminated.finishedAt,
            status: apiObj.status.phase,
          }
          new NewRelicService().logData(data)

          req.abort()
        }
      },
      // done callback is called if the watch terminates normally
      (err) => {
        // tslint:disable-next-line:no-console
      },
    )
  }

  async ensurePod(name, uid) {
    let allPods = await k8s.topPods(
      this.deployClient,
      this.metricsClient,
      process.env.namespace,
    )
    let searchedPod = allPods.find(({ Pod }) => {
      return (
        Pod.metadata.labels['job-name'] === name &&
        Pod.metadata.labels['controller-uid'] === uid
      )
    })
    return searchedPod || null
  }

  async ensureJob(name) {
    let allJobs = await this.jobClient.listNamespacedJob(process.env.namespace)
    let jobToDestroy = allJobs.body.items.find(
      ({ metadata }) => metadata.name === name,
    )

    return jobToDestroy || null
  }

  ensureProjectEnvironments(project, environment) {
    // TODO: verify if project and enviroment exist (repository)
  }

  handleTestTags(str) {
    const strList = str.split(',')
    var tags = []
    for (var strItem of strList) {
      if (strItem.includes('@')) tags.push(strItem)
    }
    const result = tags.length > 0 ? `--tags=${tags.join(' or ')}` : ''
    return result
  }

  handleTestCommands(str) {
    const strList = str.split(',')
    let commands = []
    let ratio

    for (var strItem of strList) {
      if (strItem.includes('ratio')) ratio = strItem.slice('--ratio='.length)
      else if (strItem.includes('--')) commands.push(strItem)
    }
    let testCommands = commands.length > 0 ? `${commands.join(' ')}` : ''
    return {
      testCommands,
      ratio,
    }
  }

  handleTagsToPodName(tags) {
    return tags.length > 0
      ? '-' +
          tags
            .replaceAll('@', '')
            .replaceAll('--tags=', '')
            .replaceAll(' or ', '-')
      : ''
  }

  handleDevelopmentImage(tags) {
    return (
      tags
        .split(',')
        .find((t) => t.includes('review'))
        ?.trim()
        .replace('review=', '') || undefined
    )
  }
}

module.exports = {
  PodService,
}
