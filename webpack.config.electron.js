const webpack = require('webpack')
require('dotenv').config()
console.log(process.env)
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      isElectron: JSON.stringify(true),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL),
      'process.env.REACT_APP_UI_URL': JSON.stringify(process.env.REACT_APP_UI_URL),
      'process.env.REACT_APP_SOCKET_SSO_URL': JSON.stringify(process.env.REACT_APP_SOCKET_SSO_URL),
      'process.env.REACT_APP_VIASOCKET_URL': JSON.stringify(process.env.REACT_APP_VIASOCKET_URL),
      'process.env.REACT_APP_UI_IP': JSON.stringify(process.env.REACT_APP_UI_IP),
      'process.env.REACT_APP_DOMAINS_LIST': JSON.stringify(process.env.REACT_APP_DOMAINS_LIST),
      'process.env.REACT_APP_CUSTOM_DOMAINS_LIST': JSON.stringify(process.env.REACT_APP_CUSTOM_DOMAINS_LIST),
      'process.env.REACT_APP_CIRCLECI_TOKEN': JSON.stringify(process.env.REACT_APP_CIRCLECI_TOKEN),
      'process.env.REACT_APP_CIRCLECI_CONTEXT_ID': JSON.stringify(process.env.REACT_APP_CIRCLECI_CONTEXT_ID),
      'process.env.REACT_APP_STEVE_WIDGET_URL': JSON.stringify(process.env.REACT_APP_STEVE_WIDGET_URL),
      'process.env.REACT_APP_STEVE_PROJECT_ID': JSON.stringify(process.env.REACT_APP_STEVE_PROJECT_ID),
      'process.env.REACT_APP_STEVE_AUTHKEY': JSON.stringify(process.env.REACT_APP_STEVE_AUTHKEY),
      'process.env.REACT_APP_STEVE_WIDGET_ID': JSON.stringify(process.env.REACT_APP_STEVE_WIDGET_ID),
      'process.env.isElectron': JSON.stringify(true)
    })
  ]
}
