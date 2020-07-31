// This example will show you:
// - How to create a Hypercore and load it on a different device
// - How to make sure you've got some initial data before reading
// - How to identify peers
//
// Go to the root of the workshop folder and run:
// node ./Hypercore/02_Load_a_core.js

// First, you'll want to load the SDK
const SDK = require('dat-sdk')
const { once } = require('events')

// Dat-SDK makes use of JavaScript promises
// You'll usually want to use it from an async function
async function main () {
  // Wrap your code in try-catch to handle errors
  try {
    var {
      Hypercore: Hypercore1,
      close: close1
    } = await SDK({
      persist: false
    })
    var {
      Hypercore: Hypercore2,
      close: close2
    } = await SDK({
      persist: false
    })

    const original = Hypercore1('example')

    await original.append('Hello World!')

    // Get the core key
    const { key } = original

    console.log('Prepared core', { key })

    // Load the drive on the second peer using the key
    const copy = Hypercore2(key)

    await copy.ready()

    console.log('Loaded core on other peer', copy.key, copy.writable)

    // If we try to load data right away, it might not be loaded yet
    try {
      await copy.get(0)
    } catch (e) {
      console.error(e.message)
    }

    if (copy.peers.length) {
      console.log('Already found peers for core')
    } else {
      console.log('Waiting for peers to connect')
      const [peer] = await once(copy, 'peer-open')
      // You can get a peer's identity from their public key in the connection
      console.log('Connected to peer', peer.remotePublicKey)
    }

    const contents = await copy.get(0, 'utf8')

    console.log('Read contents from remote', { contents })

    try {
      // You can not write to drives you loaded from elsewhere
      await copy.append('Goodbye World')
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
