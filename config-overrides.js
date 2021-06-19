// Adds the environment variables for desktop build
const webpack = require('webpack')
require('dotenv').config()
module.exports = function override (config, env) {
  const desktopConfiguration = { }
  // Add the default React environment variables
  Object.keys(process.env).forEach(key => {
    desktopConfiguration[`process.env.${key}`] = JSON.stringify(process.env[key])
  })
  // Adds the desktop specific environment variables
  desktopConfiguration['process.env.REACT_APP_IS_DESKTOP'] = JSON.stringify(true)
  config.plugins.push(
    new webpack.DefinePlugin(desktopConfiguration))
  return config
}
