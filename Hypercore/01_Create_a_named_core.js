// This example will show you:
// - How to create a Hypercore
// - How to add data to it
// - How to use versions and indexes
//
// Go to the root of the workshop folder and run:
// node ./Hyperdrive/01_Create_a_named_drive.js

// First, you'll want to load the SDK
const SDK = require('dat-sdk')

// Dat-SDK makes use of JavaScript promises
// You'll usually want to use it from an async function
async function main () {
  try {
    var {
      Hypercore,
      close
    } = await SDK({
      persist: false
    })

    // Same as Hyperdrive you can give names to create a unique core
    const core = Hypercore('example')

    await core.ready()

    // Cores also have keys which you can use for URLs
    const { key } = core

    console.log('Created core', { key })

    // You can write to hypercores by appending some data at the end
    // You can't specify an index when writing, just add to the end
    await core.append('Hello World')

    // Every time a core gets updated, it's length increments
    console.log('Appended to core', core.length)

    // You can load data by it's index
    const chunk = await core.get(0)

    // By default it'll be a Buffer or whatever valueEncoding is in the constructor
    console.log('Loaded chunk', chunk)

    // You can also specify the valueEncoding when you get data
    const text = await core.get(0, { valueEncoding: 'utf8' })

    console.log('Loaded as text', text)
  } finally {
    // Make sure to always close the SDK when you're done
    // This will remove entries from the p2p network
    // Which is important for speeding up peer discovery
    await close()
  }
}

// This will run your code
main().catch((e) => {
  // If there's an error blow up the process
  process.nextTick(() => {
    throw e
  })
})
