const { handlebars } = require('hbs');
const responseTemplate = require('./responseTemplate');

/**
 * Post a comment containing the build log on every Pull Request containing the failed commit
 *
 * @param pull_requests - an Array of pull_request objects
 * @param context - The Probot context object
 * @param logger - The Probot logger
 */
exports.postPRComments = (context, pull_requests, buildLog, logger) => {
  const compiledBody = handlebars.compile(responseTemplate);

  pull_requests.forEach(pull => {
    const { number, head: { sha } } = pull;
    const body = compiledBody({ buildLog, sha: sha.substring(0,8) });

    context.github.issues.createComment(context.repo({ number, body }))
      .then(res =>logger.trace(res, 'Pull Request comment successfully posted'))
      .catch(err => logger.error(err, 'Pull Request comment failed to post'));
  });
};
