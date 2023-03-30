module.exports = function override(config) {
  config.resolve.fallback = {
    querystring: require.resolve('querystring-es3')
  }
  config.ignoreWarnings = [/Failed to parse source map/]
  return config
}
