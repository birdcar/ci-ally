const axios = require('axios');

async function getBuildLog(buildUrl) {
  // Pull the Travis build ID off of the buildUrl
  const buildId = buildUrl.split('/').pop();

  // Get the build data from Travis' API
  const { data } = await axios.get(
    `https://api.travis-ci.com/v3/build/${buildId}`
  );

  // Grab the ID of the first job in the jobs array
  const jobId = data.jobs[0].id;

  // Request the log for that specific job ID
  const { data: jobLog } = await axios.get(
    `https://api.travis-ci.com/v3/job/${jobId}/log.txt`
  );

  // Return the raw text log
  return jobLog;
}

function parseLog(jobLog) {
  // parse the job log for npm test output
  const reg = /\[0K\$\snpm\stest(?:\r\n|\n)*([\s\S]+)[\r\n]+.*Test failed\./g;
  const match = reg.exec(jobLog);

  // If no match is found, return false
  if (!match) {
    return false;
  }

  // Trim the output
  const errors = match[1].trim();

  // Return a new object
  return {
    errors,
    command: 'npm test'
  };
}

function postPRComments({ pull_requests, context }) {
  pull_requests.forEach(({ number }) => {
    context.github.issues.createComment({
      number,
      body: 'This worked'
    }).then(res => console.log(res))
  })
}

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.on('check_run.completed', async context => {
    // Destructure necessary data from the payload
    const {
      check_run: { details_url: travisBuild, conclusion, name: checkName },
      pull_requests
    } = context.payload;

    // Fail fast if the conclusion isn't failure or the specific check isn't 'Travis CI - Pull Request'
    if (conclusion !== 'failure' || checkName !== 'Travis CI - Pull Request') {
      return null;
    }

    const rawLog = await getBuildLog(travisBuild);
    const buildResults = parseLog(rawLog);

    if (!buildResults) {
      return null;
    }

    return postPRComments({
      pull_requests,
      context
    });
  });
};
