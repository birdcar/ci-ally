const axios = require('axios');

exports.getBuildLog = async (buildUrl) => {
  // Pull the Travis build ID off of the buildUrl
  const buildId = buildUrl.split('/').pop();

  // Get the build data from Travis' API
  const { data } = await axios.get(
    `https://api.travis-ci.com/v3/build/${buildId}`
  );

  // Grab the ID of the first job in the jobs array
  // @todo Look into handling more than one job
  // @body Currently, the app will only get the logs for the first job in the payload 
  const jobId = data.jobs[0].id;

  // Request the log for that specific job ID
  const { data: jobLog } = await axios.get(
    `https://api.travis-ci.com/v3/job/${jobId}/log.txt`
  );

  // Return the raw text log
  return jobLog;
}

exports.parseLog = (jobLog) => {
  // Parse the job log for npm test output
  const re = /\[0K\$\snpm\stest(?:\r\n|\n)*([\s\S]+)[\r\n]+.*Test failed\.\s+See above for more details\./g;
  const match = re.exec(jobLog);

  // If no match is found, return false
  if (!match) {
    return false;
  }

  // Remove unicode and extra whitespace from the output text
  const output = match[1].replace(/[^\x00-\x7F]/g, "").trim();

  // Return the build log
  return output;
}
