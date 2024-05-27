// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db

const fs = require("fs")
const path = require("path")
const electronNotarize = require("electron-notarize")
module.exports = async function (params) {
  // Only notarize the app on Mac OS only.
  if (process.platform !== "darwin") {
    return
  }
  // Same appId in electron-builder.
  const appId = "com.hitman.app" // something like 'com.app_name.io'
  const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`)

  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`)
  }

  try {
    // DON'T COMMIT NOTARIZATION CREDENTIALS TO GIT, ALWAYS USE THEM THROUGH ENV VARS
    await electronNotarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.NOTARIZE_EMAIL, // enter credential to generate mac's electron build, follow the guide here: https://support.apple.com/en-gb/HT204397
      appleIdPassword: process.env.NOTARIZE_PASS
    })
  } catch (error) {
    console.error(error)
  }
}
