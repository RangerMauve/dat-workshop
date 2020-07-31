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
const HyperFlood = require('hyper-flood')

// Dat-SDK makes use of JavaScript promises
// You'll usually want to use it from an async function
async function main () {
  try {
    // We'll set up three instances of the SDK so they can talk to each other
    var {
      Hypercore: Hypercore1,
      // The keypair is the publicKey/secretKey pair used for connection encryption
      // This can be used to identify peers in the network
      // Your public key will show up as `peer.remotePublicKey` for other people
      keyPair: keyPair1,
      close: close1
    } = await SDK({
      persist: false
    })
    var {
      Hypercore: Hypercore2,
      keyPair: keyPair2,
      close: close2
    } = await SDK({
      persist: false
    })
    var {
      Hypercore: Hypercore3,
      keyPair: keyPair3,
      close: close3
    } = await SDK({
      persist: false
    })

    // Lets set up three peers and network them together
    // The `announce` and `lookup` options are for networking
    // Here we're setting it up so only one peer is advertising
    // And the other two are doing lookups
    // This should create a network where Core2 and Core3 aren't directly connected
    const core1 = Hypercore1('example', { advertise: true, lookup: false })
    await core1.ready()
    const core2 = Hypercore2(core1.key, { advertise: false, lookup: true })
    await core2.ready()
    const core3 = Hypercore3(core1.key, { advertise: false, lookup: true })
    await core3.ready()

    console.log('Set up cores', core1.key)

    // We're going to be using the `hyper-flood` library
    // This library lets you send messages through the network of peers
    // Without needing everyone to be connected to everyone else
    const flood1 = new HyperFlood({
      // hyper-flood needs to know what your public key is in the swarm layer
      // This is used for verifying your identity
      id: keyPair1.publicKey
    })
    core1.registerExtension('example', flood1.extension())

    const flood2 = new HyperFlood({
      id: keyPair2.publicKey
    })
    core2.registerExtension('example', flood2.extension())

    const flood3 = new HyperFlood({
      id: keyPair3.publicKey
    })
    core3.registerExtension('example', flood3.extension())

    console.log('Registered extensions')

    // We'll be listening on messages coming in to peer 3 from the others
    flood3.on('message', (message, origin, index) => console.log('Got message from flooding', message.toString('utf8'), origin, index))

    // Wait a while for all the connections to happen
    // There's probably a better way to handle this. 🤷
    // In the wild it'll be different processes and eventual
    await delay(2000)

    console.log('Sending out message to swarm')

    // We'll send a message from peer 2 which isn't connected directly to peer 3
    flood2.broadcast(Buffer.from('Hello World!'))

    // Give it some time
    await delay(500)
  } finally {
    await close1()
    await close2()
    await close3()
  }
}

// This will run your code
main().catch((e) => {
  // If there's an error blow up the process
  process.nextTick(() => {
    throw e
  })
})
