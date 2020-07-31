// This example will show you:
// - How to define extension message handlers
// - How to register protocol level extensions
// - How to register Hypercore extensions
// - How to register Hyperdrive extensions
//
// Go to the root of the workshop folder and run:
// node ./Hyperdrive/01_Extension_types.js

const SDK = require('dat-sdk')
const delay = require('delay')

// Dat-SDK makes use of JavaScript promises
// You'll usually want to use it from an async function
async function main () {
  try {
    // We'll set up two instances of the SDK so they can talk to each other
    var {
      Hypercore: Hypercore1,
      Hyperdrive: Hyperdrive1,
      registerExtension: registerExtension1,
      close: close1
    } = await SDK({
      persist: false
    })
    var {
      Hypercore: Hypercore2,
      Hyperdrive: Hyperdrive2,
      registerExtension: registerExtension2,
      close: close2
    } = await SDK({
      persist: false
    })

    // You can create reusable Extension handlers
    // Make a function that returns an object with handler info
    const handlers = (ext) => ({
      // The encoding can automatically convert between common encodings
      // JSON is pretty handy but you can use custom Protocol Buffers too
      encoding: 'json',
      // This function will get invoked every time you get a message for this extension
      // The message will be decoded from the raw bytes using whatever encoding you specified
      onmessage: (event, peer) => {
        console.log('Got message', event)
        const { message, type } = event
        if (message === 'hello') {
        // You can send an extension message to a specific peer
          ext.send({ message: 'world', type }, peer)
        }
      },
      onerror: (err) => {
        // This gets invoked if there were message parsing errors
        console.error(err)
      }
    })

    const core = Hypercore1('example1')
    const drive = Hyperdrive1('example2')
    await core.ready()
    await drive.ready()

    console.log('Set up hypercore', core.key)
    console.log('Set up hyperdrive', drive.key)

    // You can register extension messages on _all_ connections
    const protocolExt1 = registerExtension1('workshop-protocol', handlers)

    // You can register extension messages for a specific hypercore
    const coreExt1 = core.registerExtension('workshop-core', handlers)

    // You can register extension messages for a specific hyperdrive
    // Under the hood this is registering on the drive's metadata core
    const driveExt1 = drive.registerExtension('workshop-drive', handlers)

    console.log('Registered extensions on first instance')

    const broadcastAll = () => {
      console.log('Broadcasting all extensions')

      // You can broadcast messages out to all connected peers
      protocolExt1.broadcast({ message: 'hello', type: 'protocol' })
      coreExt1.broadcast({ message: 'hello', type: 'core' })
      driveExt1.broadcast({ message: 'hello', type: 'drive' })
    }

    core.on('peer-open', broadcastAll)
    drive.on('peer-open', broadcastAll)

    const coreCopy = Hypercore2(core.key)
    const driveCopy = Hyperdrive2(drive.key)

    await coreCopy.ready()
    await driveCopy.ready()

    console.log('Initialized copy drive and core')

    registerExtension2('workshop-protocol', handlers)
    coreCopy.registerExtension('workshop-core', handlers)
    driveCopy.registerExtension('workshop-drive', handlers)

    console.log('Registered extensions on second instance')

    await delay(5000)
  } finally {
    await close1()
    await close2()
  }
}

// This will run your code
main().catch((e) => {
  // If there's an error blow up the process
  process.nextTick(() => {
    throw e
  })
})
