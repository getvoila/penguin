const BaseCommand = require('../base')
const {buildConfig, loadStacks} = require('../../lib/task-actions')
const runTask = require('../../lib/run-task')
const dockerUtils = require('../../lib/docker-utils')
const logger = require('../../lib/logger')

class StatusCommand extends BaseCommand {
  async run() {
    const {flags, args} = this.parse(StatusCommand)

    const tasks = [
      {
        action: ctx => buildConfig(ctx, false)
      },
      {
        action: ctx => {
          flags['all'] = true

          return loadStacks(ctx, flags, args)
        }
      },
      {
        action: ctx => {
          const data = []

          ctx.config.projectStacks.map(stack => {
            const containerName = dockerUtils.containerName(ctx.config.projectId, stack.name)

            data.push({
              stackName: stack.name,
              mountedHostDir: stack.hostDir,
              containerName: containerName,
              containerStatus: dockerUtils.containerStatus(containerName)
            })
          })

          logger.table({
            stackName: { header: 'Stack' },
            mountedHostDir: { header: 'Mounted Directory' },
            containerName: { header: 'Image Name' },
            containerStatus: { header: 'Status' }
          }, data)
        }
      }
    ]

    await runTask(tasks)
  }
}

StatusCommand.aliases = ['stacks:list']

StatusCommand.description = `List all project stacks and their status details.`

module.exports = StatusCommand
