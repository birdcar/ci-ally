const genCommentBody = require('./genCommentBody')

/**
 * Post a comment containing the build log on every Pull Request containing the failed commit
 *
 * @param pullRequests - an Array of pull_request objects
 * @param context - The Probot context object
 * @param logger - The Probot logger
 */
exports.postPRComments = (context, pullRequests, buildLog, logger) => {
  pullRequests.forEach(pull => {
    const { number, head: { sha } } = pull
    const body = genCommentBody(sha, buildLog)

    context.github.issues.createComment(context.repo({ number, body }))
      .then(res => logger.trace(res, 'Pull Request comment successfully posted'))
      .catch(err => logger.error(err, 'Pull Request comment failed to post'))
  })
}
