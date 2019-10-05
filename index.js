/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on('check_run', async context => {
    app.log("I'm responding to check_run")
    const { owner, repo } = context.repo
    const { id: check_run_id } = context.check_run.id
    const annotations = context.github.checks.listAnnotations({
      owner,
      repo,
      check_run_id
    })
    app.log(annotations)
  })

  app.on('check_suite', async context => {
    app.log("I'm responding to check_suite")
  })
}
