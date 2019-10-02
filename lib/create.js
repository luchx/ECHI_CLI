const path = require('path')
const fs = require('fs-extra')

const inquirer = require('inquirer')
const Ora = require('ora')
const chalk = require('chalk')
const TPL_TYPE = require('../lib/util/enum')
const download = require('download-git-repo')

module.exports = async function create (name) {
  const { bolierplateType } = await inquirer.prompt([
    {
      name: 'bolierplateType',
      type: 'list',
      default: 'vue',
      choices: ['vue', 'react'],
      description: 'Please choose a template u want use.'
    }
  ])

  const tempDir = path.join(process.cwd(), name)
  const spinner = new Ora({
    text: ` Creating template of project ${bolierplateType} in ${tempDir}`
  })

  spinner.start()

  download(`direct:${TPL_TYPE[bolierplateType]}`, name, { clone: true }, function (err) {
    console.log(err ? 'Error' : 'Success')
    if (err) {
      spinner.fail()
      console.log(chalk.red(JSON.stringify(err)))
      return
    }
    // fs.removeSync('.git')
    spinner.succeed()
    console.log(
      `👉  Successfully created project template of ${bolierplateType} \n\n`
    )
  })
}
