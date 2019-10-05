const axios = require('axios')

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on('check_run.completed', async context => {
    app.log("I'm responding to check_run")
    const { check_run: { id, details_url, conclusion } } = context.payload
    const { owner, repo } = context.repo()
    app.log(id)
    app.log(details_url)
    app.log(conclusion)
    if (conclusion === 'failure') {
      const buildId = details_url.split('/').pop()
      app.log(buildId)
      const { data } = await axios.get(`https://api.travis-ci.com/v3/build/${buildId}`)
      const jobId = data.jobs[0].id
      const { data: jobLog } = await axios.get(`https://api.travis-ci.com/v3/job/${jobId}/log.txt`)
      app.log(`Check run: ${id}`)
      app.log(`Repository: ${owner}/${repo}`)
      const reg = /\[0K\$\snpm\stest(?:\r\n|\n)*([\s\S]+)[\r\n]+.*Test failed\./g
      const result = reg.exec(jobLog)
      if (!result) {
        return false
      }
      let content = result[1].trim()
      const obj = { content, command: 'npm test' }
      app.log(obj)
    }
  })
}
