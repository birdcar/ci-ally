# ci-ally

> A GitHub App built with [Probot](https://github.com/probot/probot) that helps new contributors understand and fix failing builds.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Background

I built this [Probot](https://probot.github.io) app in response to a take-home assignement given to me by GitHub during the interview process for their Learning Engineer role. The specific assignment provided is described below:

```markdown
We would like to gain insight into your ability to learn technical topics. Customers will frequently ask for assistance 
on projects. These requests will require you to learn new topics. This exercise will hopefully give us insight into your 
approach and aptitude in meeting these customers needs.

Continuous integration is a valuable way to ensure that all changes to a project’s code are tested, but keeping track of 
CI builds (especially those that fail) can be challenging in many cases. For example, a contributor to an open source 
project might open a pull request whose tests fail, but complicated build logs appear out of the context of a pull request,
and may turn away new developers.

Your mission, should you choose to accept it, is to use GitHub’s API and webhooks to build a Node.js application that 
retrieves logs from the continuous integration service and creates a new comment in the relevant pull request, describing 
(with the error logs) what failed.

**Some details**
- The app only needs to work with a single CI provider (ex: CircleCI, TravisCI, etc).
- It only needs to work with public repositories.
- The app can choose to only work with a specific test runner (ex: Jest, Mocha, etc).
- Your application should have integration/unit tests where applicable.

**Submission**
- A repository with well-documented code and a descriptive README, explaining your approach and the challenges you 
encountered (and how you solved them).
- A second repository in which you've demoed your app, showing an open pull request where your app has created a comment.
```

## Learning

Upon reading the prompt, my initial thought was that I'd build it to work with the new builtin [GitHub CI/CD](https://github.blog/2019-08-08-github-actions-now-supports-ci-cd/), which I've used on other projects and have loved. Unfortunately, it appears that getting the log output from the API isn't possible (or at least I couldn't figure it out in the docs).

That meant using Travis CI, because I at least had some familiarity with it and also because Probot comes with a pre-configured `travis.yml` file, making setup and manual behavioral testing easy. After that, the only real decision I had left was which test runner to support, and I went with supporting [Jest](https://jestjs.io).

From there, I took about an hour and read over the documentation for Probot, Travis-CI, and [GitHub API's WebHook documentation](https://developer.github.com/webhooks/).

This led to my first little bit of confusion. I remembered the Commit Status API being the way to get job information from Travis CI, so I first set about getting the the bot to catch and respond to that event. However, I quickly discovered that that event wasn't ever firing, even when I purposefully caused a build to fail.

After doing a little bit of research, I discovered that [Travis CI deprecated their use of the Commit Status API](https://blog.travis-ci.com/2018-09-27-deprecating-github-commit-status-api-for-github-apps-managed-repositories) back in September 2018, and would now be relying solely on the Check Runs API.

With that information in mind, I updated the permissions for the application to remove the "read" permission I had for the Status API and started examining the payload that the bot receives when a "check_run" completes. Travis doesn't appear to take advantage of check run [annotations](https://developer.github.com/v3/checks/runs/#list-annotations-for-a-check-run), and the output they provide leaves quite a bit to be desired, which meant getting the Travis build ID from the payload, making a request to Travis' API for the build info (which included an array of job information), and then making an additional request to Travis for the job log.

Once I got that wired up, I had to examine the raw text of the log and figure out the best way to parse it. Unfortunately, this led to the infinite abyss that is Regular Expressions. I loaded the log into [RegExr](https://regexr.com/), and set about trying to come up with an expression that worked. This is where I honestly sunk the most time while building this bot. However, after about an hour I had a regex that would reliably pull out the section of the log I needed.

After posting the first comment containing the log, I discovered that there were some invisible ANSI codes in the log that were causing an ugly (and likely confusing) render. So I went back to regexer and wrote a second regex that would clean the log of those codes provide me with a usable log for the Pull Request comment the bot would be posting.

It was at this point that I realized I had written no tests, and also that I had spent about as much time as I believe I was supposed to spend on this. So I decided to wrap up by modularizing and documenting my code, and then writing tests for the critical pieces of the application.

### Post Mortem

After spending as long as I felt was fair getting the application built, documented, tested, and deployed, I think the weaknesses of the integration as it stands right now are as follows:

1. It's pretty weakly tested (e.g. no end-to-end tests, only one integration test and two unit tests)
2. It only fetches logs for the first job in the "jobs" array sent back from Travis. If your build fails because of a later job, I won't be able to show you the log output.
3. It only integrates with Travis CI
4. It uses RegEx to both parse the logs and also strip ansi color codes. In addition to feeling pretty fragile, it unavoidably locks me into supporting a single test runner.
5. It currently posts a new comment every time a build fails, and that feels like it could be noisy on large open source projects. I'd love to have it check for an existing comment and update that comment instead if it exists.

I'd love to provide better test coverage for the app at a minimum, which is followed slightly by a desire to support configuration for multiple test runners and CI providers.

## Contributing

If you have suggestions for how ci-ally could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](.github/CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Nick Cannariato (https://github.com/nickcannariato/ci-ally)
