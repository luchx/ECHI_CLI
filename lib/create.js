const path = require('path')
const fs = require('fs-extra')

const inquirer = require('inquirer')
const Ora = require('ora')
const chalk = require('chalk')
const logSymbols = require('log-symbols')
const validateProjectName = require('validate-npm-package-name')
const TPL_TYPE = require('../lib/util/enum')
const downloadFromRemote = require('../lib/downloadFromRemote')

module.exports = async function create (projectName) {
  const cwd = process.cwd()
  const targetDir = path.resolve(cwd, projectName)
  const name = path.relative(cwd, projectName)

  const result = validateProjectName(name)
  if (!result.validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${name}"`))
    result.errors && result.errors.forEach(err => {
      console.error(chalk.red.dim('Error: ' + err))
    })
    result.warnings && result.warnings.forEach(warn => {
      console.error(chalk.red.dim('Warning: ' + warn))
    })
    process.exit(1)
  }

  if (fs.existsSync(targetDir)) {
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
        choices: [
          { name: 'Overwrite', value: 'overwrite' },
          { name: 'Cancel', value: false }
        ]
      }
    ])
    if (!action) {
      return
    } else if (action === 'overwrite') {
      console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
      await fs.remove(targetDir)
    }
  }

  const { bolierplateType } = await inquirer.prompt([
    {
      name: 'bolierplateType',
      type: 'list',
      default: 'vue',
      choices: [
        {
          name: 'Vue',
          value: 'vue'
        },
        {
          name: 'React',
          value: 'react'
        }
      ],
      message: 'Select the boilerplate type.'
    }
  ])

  const remoteUrl = TPL_TYPE[bolierplateType]
  console.log(logSymbols.success, `Creating template of project ${bolierplateType} in ${targetDir}`)
  const spinner = new Ora({
    text: `Download template from ${remoteUrl}\n`
  })

  spinner.start()
  downloadFromRemote(remoteUrl, projectName).then(res => {
    spinner.succeed()
    console.log(logSymbols.success, chalk.green(`Successfully created project template of ${bolierplateType}\n`))
    console.log(chalk.grey('cd ' + projectName + '\nnpm install\nnpm run dev\n'))
    process.exit()
  }).catch((err) => {
    console.log(logSymbols.error, err)
    spinner.fail(chalk.red('Sorry, it must be something error,please check it out. \n'))
    process.exit(-1)
  })
}
