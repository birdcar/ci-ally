const axios = require('axios')

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.on('check_run.completed', async context => {
    const { check_run: { details_url, conclusion } } = context.payload

    if (conclusion === 'failure') {
      const buildId = details_url.split('/').pop()
      const { data } = await axios.get(`https://api.travis-ci.com/v3/build/${buildId}`)
      const jobId = data.jobs[0].id
      const { data: jobLog } = await axios.get(`https://api.travis-ci.com/v3/job/${jobId}/log.txt`)
      const reg = /\[0K\$\snpm\stest(?:\r\n|\n)*([\s\S]+)[\r\n]+.*Test failed\./g
      const result = reg.exec(jobLog)

      if (!result) {
        return false
      }

      const content = result[1].trim()
      const obj = { content, command: 'npm test' }
      app.log(obj)
    }
  })
}
