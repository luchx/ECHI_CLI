const path = require('path')
const fs = require('fs-extra')

const inquirer = require('inquirer')
const Ora = require('ora')
const chalk = require('chalk')
const TPL_TYPE = require('../lib/util/enum')
const downloadFromRemote = require('../lib/downloadFromRemote')

module.exports = async function create (name) {
  // TODO: 添加校验项目名 validateName(name)
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

  const tempDir = path.join(process.cwd(), name)
  const spinner = new Ora({
    text: ` Creating template of project ${bolierplateType} in ${tempDir}`
  })

  spinner.start()
  downloadFromRemote(TPL_TYPE[bolierplateType], name).then(res => {
    spinner.succeed(`👉  ${chalk.green('Successfully')} created project template of ${bolierplateType} \n`)
    process.exit()
  }).catch(err => {
    console.log(chalk.red(JSON.stringify(err)))
    spinner.fail('👉  Sorry, it must be something error,please check it out. \n')
    process.exit(-1)
  })
}
