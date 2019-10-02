const download = require('download-git-repo')

module.exports = function downloadFromRemote (url, name) {
  return new Promise((resolve, reject) => {
    download(`direct:${url}`, name, { clone: true }, function (err) {
      console.log(err ? 'Error' : 'Success')
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}
