const path = require('path')
const fs = require('fs-extra')

const inquirer = require('inquirer')
const Ora = require('ora')
const chalk = require('chalk')
const validateProjectName = require('validate-npm-package-name')
const TPL_TYPE = require('../lib/util/enum')
const downloadFromRemote = require('../lib/downloadFromRemote')

module.exports = async function create (projectName) {
  const cwd = process.cwd()
  const targetDir = path.resolve(cwd, projectName || '.')
  const name = path.relative('../', cwd)

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
          { name: 'Merge', value: 'merge' },
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

  const spinner = new Ora({
    text: ` Creating template of project ${bolierplateType} in ${targetDir}`
  })

  spinner.start()
  downloadFromRemote(TPL_TYPE[bolierplateType], projectName).then(res => {
    spinner.succeed(`👉  ${chalk.green('Successfully')} created project template of ${bolierplateType} \n`)
    process.exit()
  }).catch(err => {
    console.log(chalk.red(JSON.stringify(err)))
    spinner.fail('👉  Sorry, it must be something error,please check it out. \n')
    process.exit(-1)
  })
}
