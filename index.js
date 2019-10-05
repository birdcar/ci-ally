/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on('check_run', async context => {
    app.log("I'm responding to check_run")
    app.log(context)
  })

  app.on('check_suite', async context => {
    app.log("I'm responding to check_suite")
  })
}
