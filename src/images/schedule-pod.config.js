
const scheduleJob = (image) => {
  return {
    apiVersion: 'batch/v1',
    kind: 'CronJob',
    metadata: {
      annotations: {},
      name: `#replace#`,
      namespace: 'automationtest-ns',
    },
    spec: {
      schedule: '*/5 * * * *',  // Specify your cron schedule here
      jobTemplate: {
        spec: {
          backoffLimit: 0,
          ttlSecondsAfterFinished: 0,
          template: {
            spec: {
              containers: [
                {
                  name: 'container-name',
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
      },
    },
  }
}

module.exports = {
  scheduleJob
}
