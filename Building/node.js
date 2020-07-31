const SDK = require('dat-sdk')

module.exports = async function myLibrary (opts = {}) {
  const sdk = opts.sdk || await SDK(opts)

  const { Hyperdrive } = sdk

  async function fileToArchive (path, data) {
    const drive = Hyperdrive('my-library')

    await drive.writeFile(path, data)

    return drive
  }

  return {
    fileToArchive
  }
}
