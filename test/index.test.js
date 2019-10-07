// Node dependencies
const fs = require('fs')
const path = require('path')

// Probot dependencies
const { Probot } = require('probot')
const nock = require('nock')

// ci-ally implementation
const ciAlly = require('..')
const { getBuildLog, parseLog } = require('../helpers/travis')
// const getCommentBody = require('../helpers/genCommentBody')

// Fixtures
const failurePayload = require('./fixtures/check_run.completed-failure.json')
const prCommentBody = require('./fixtures/prCommentBody.json')
const buildInfo = require('./fixtures/travis/buildInfo.json')
const rawLog = fs.readFileSync(path.join(__dirname, 'fixtures', 'travis', 'log.txt'), 'utf8')
const rawTestOutput = fs.readFileSync(path.join(__dirname, 'fixtures', 'travis', 'parsedLog.txt'), 'utf8')

nock.disableNetConnect()

describe('ci-ally', () => {
  let probot

  beforeEach(() => {
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(ciAlly)

    // just return a test token
    app.app = () => 'test-token'
  })

  test('Responds to a failed check_run by createing a PR comment', async () => {
    // Test that we correctly return a test token
    nock('https://api.github.com')
      .post('/app/installations/1/access_tokens')
      .reply(200, { token: 'test-token' })

    // Catch requests to travis for the build info
    nock('https://api.travis-ci.com')
      .get('/v3/build/130588813')
      .reply(200, buildInfo)

    // Catch requests to Travis for the raw job log
    nock('https://api.travis-ci.com')
      .get('/v3/job/242559998/log.txt')
      .reply(200, rawLog)

    // "post" a PR comment
    nock('https://api.github.com')
      .post('/repos/nickcannariato/ci-ally/issues/4/comments', body => {
        expect(body).toMatchObject(prCommentBody)
        return true
      })
      .reply(201)

    // Receive a webhook event
    await probot.receive({ name: 'check_run.completed', payload: failurePayload })
  })
})

describe('helpers/travis.js', () => {
  it('Requests appropriate build log from Travis', async () => {
    const buildUrl = 'https://api.travis-ci.com/v3/build/130588813'

    nock('https://api.travis-ci.com')
      .get('/v3/build/130588813')
      .reply(200, buildInfo)

    nock('https://api.travis-ci.com')
      .get('/v3/job/242559998/log.txt')
      .reply(200, rawLog)

    expect(getBuildLog(buildUrl)).resolves.toEqual(rawLog)
  })

  it('Extracts test output from build log', () => {
    const parsedLog = parseLog(rawLog)

    expect(parsedLog).toEqual(rawTestOutput)
  })
})
