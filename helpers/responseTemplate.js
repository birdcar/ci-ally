module.exports = `
### The Travis CI build is failing as of <code>{{ sha }}</code>

Thanks for your contribution! :tada: :raised_hands:

Unfortunately, it looks like the Travis CI build for this Pull Request is currently failing.

Here's the output log from our tests:

\`\`\`
{{ buildLog }}
\`\`\`

Good luck! If you feel like you're stuck but want to keep working on this, _please_ don't hesitate to ping one of the maintainers and they'll get back to you shortly
`;
