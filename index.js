/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on('status', async context => {
    app.log("I'm responding to status")
    const { payload } = context
    const { owner, repo } = context.repo()

    app.log(owner, repo)
    app.log(payload)
  })

  app.on('check_run', async context => {
    app.log("I'm responding to check_run")
  })

  app.on('check_suite', async context => {
    app.log("I'm responding to check_suite")
  })
}
