/**
 * Post a comment containing the build log on every Pull Request containing the failed commit
 *
 * @param pull_requests - an Array of pull_request objects
 * @param context - The Probot context object
 * @param logger - The Probot logger
 */
exports.postPRComments = (pull_requests, { github: { issues } }, logger) => {
  const body = 'This is a second test comment body.';

  pull_requests.forEach(({ number }) => {
    issues.createComment(context.repo({ number, body }))
      .then(res =>logger.trace(res, 'Pull Request comment successfully posted'))
      .catch(e => logger.error(e, 'Pull Request comment failed to post'));
  });
};
