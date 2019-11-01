const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const yaml = require('js-yaml')

const config = require('../lib/config/loader')
const runTask = require('../lib/run-task')
const VoilaError = require('../lib/error/voila-error')

class ConfigInitCommand extends Command {
  async run() {
    const {flags} = this.parse(ConfigInitCommand)
    const cmd = this
    const ymlPath = config.yamlConfigPath

    const tasks = [
      {
        title: 'Generating a new config file',
        action: async () => {
          if (fs.existsSync(ymlPath) && !flags.force) {
            throw new VoilaError("File already exists")
          } else {
            fs.writeFileSync(ymlPath, yaml.safeDump(config.generateConfig()), (err) => {
              throw new Error(err.message)
            })

            return `New ".voila.yml" file was successfully generated in the current directory`
          }
        }
      }
    ]

    await runTask(tasks, cmd)
  }
}

ConfigInitCommand.aliases = ['init', 'config:init']

ConfigInitCommand.description = `create a new config file`

ConfigInitCommand.flags = {
  force: flags.boolean({
    char: 'f',
    description: `override existing config file`,
    default: false
  })
}

module.exports = ConfigInitCommand
