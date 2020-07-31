// This example will show you:
// - How to create a Hyperdrive and load it on a different device
// - How to make sure you've got some initial data before reading
// - How to identify peers
//
// Go to the root of the workshop folder and run:
// node ./Hyperdrive/02_Load_someones_drive.js

// First, you'll want to load the SDK
const SDK = require('dat-sdk')
const { once } = require('events')

// Dat-SDK makes use of JavaScript promises
// You'll usually want to use it from an async function
async function main () {
  // Wrap your code in try-catch to handle errors
  try {
    // This time we're going to create two instances of the SDK to simulate there being two peers
    var {
      Hyperdrive: Hyperdrive1,
      close: close1
    } = await SDK({
      persist: false
    })
    var {
      Hyperdrive: Hyperdrive2,
      close: close2
    } = await SDK({
      persist: false
    })

    // Create your writable drive as before
    const original = Hyperdrive1('example')

    await original.writeFile('/example.txt', 'Hello World!')

    // Get the drive key
    const { key } = original

    console.log('Prepared drive', { key })

    // Load the drive on the second peer using the key
    const copy = Hyperdrive2(key)

    await copy.ready()

    console.log('Loaded drive on other peer', copy.key, copy.writable)

    // If we try to load data right away, it might not be loaded yet
    try {
      await copy.readFile('/example.txt', 'utf')
    } catch (e) {
      console.error(e.message)
    }

    if (copy.peers.length) {
      console.log('Already found peers for drive')
    } else {
      console.log('Waiting for peers to connect')
      const [peer] = await once(copy, 'peer-open')
      // You can get a peer's identity from their public key in the connection
      console.log('Connected to peer', peer.remotePublicKey)
    }

    const contents = await copy.readFile('/example.txt', 'utf8')

    console.log('Read file from remote', { contents })

    try {
      // You can not write to drives you loaded from elsewhere
      await copy.writeFile('example2.txt', 'Goodbye World')
    } catch (e) {
      console.error(e.message)
    }
  } finally {
    // Make sure to always close the SDK when you're done
    // This will remove entries from the p2p network
    // Which is important for speeding up peer discovery
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
