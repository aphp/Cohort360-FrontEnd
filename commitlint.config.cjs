module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 300],
    'footer-max-length': [0, 'always', 300],
    'body-max-line-length': [0]
  }
}
