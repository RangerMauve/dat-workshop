// This example will show you:
// - How to watch for changes in a drive
// - How to stop watching for changes
//
// Go to the root of the workshop folder and run:
// node ./Hyperdrive/04_Watch_changes.js

// First, you'll want to load the SDK
const SDK = require('dat-sdk')
const { once } = require('events')
const delay = require('delay')

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

    const copy = Hyperdrive2(original.key)

    await copy.ready()

    // Wait for the connection to be made
    if (!copy.peers.length) {
      await once(copy, 'peer-open')
    }

    // You can watch for changes at specific file paths
    // You can use `/` to represent _all_ changes
    // The watcher doesn't take mounts into account yet
    const watcher = copy.watch('/', () => {
      console.log('Change detected', copy.version)
    })

    console.log('Writing')
    await original.writeFile('/example.txt', new Date().toString())

    await delay(1000)

    console.log('Writing')
    await original.writeFile('/example.txt', new Date().toString())

    await delay(1000)

    // You can stop listening for changes by destroying the watcher
    console.log('Stopping watcher')
    watcher.destroy()

    console.log('Writing')
    await original.writeFile('/example.txt', new Date().toString())

    await delay(1000)

    console.log('No changes emitted!')
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
