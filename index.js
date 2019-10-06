const { getBuildLog, parseLog } = require('./helpers/travis')
const { postPRComments } = require('./helpers/actions')

module.exports = app => {
  app.on('check_run.completed', async context => {
    // Destructure necessary data from the payload
    const {
      check_run: { details_url: travisBuild, conclusion, name: checkName, pull_requests: pullRequests }
    } = context.payload

    // Exit fast if the conclusion isn't failure or the specific check isn't 'Travis CI - Pull Request'
    if (conclusion !== 'failure' || checkName !== 'Travis CI - Pull Request') {
      return null
    }

    const rawLog = await getBuildLog(travisBuild)
    const parsedLog = parseLog(rawLog)

    if (!parsedLog) {
      return null
    }

    return postPRComments(context, pullRequests, parsedLog, app.log)
  })
}
