// This example will show you:
// - How to initialize the Dat SDK
// - How to create a "named" Hyperdrive
// - How to write files to a Hyperdrive
// - How to properly clean up your resources
//
// Go to the root of the workshop folder and run:
// node ./Hyperdrive/01_Create_a_named_drive.js

// First, you'll want to load the SDK
const SDK = require('dat-sdk')

// Dat-SDK makes use of JavaScript promises
// You'll usually want to use it from an async function
async function main () {
  // Wrap your code in try-catch to handle errors
  try {
    // You can pull out various bits of the SDK
    // and set them up as variables
    var {
      // This is the main API for creating and loading Hyperdrives
      Hyperdrive,
      // This function is used for releasing resources from the SDK
      close

      // The exported SDK function is an async function
      // That's why you'll want to use `await`
    } = await SDK({
      // You can pass configuration options here
      // You can see options here: https://github.com/datproject/sdk/#const-hypercore-hyperdrive-resolvename-keypair-derivesecret-registerextension-close--await-sdkopts
      // This particular option specifies that we don't want to save data
      // Once the SDK is closed any data that was created will be cleared
      persist: false
    })

    // Creating a Hyperdrive involves specifying a name for it
    // The `name` will yield a unique Hyperdrive key on your computer
    // Every time you use the same `name` on your computer will get the same drive
    // The `name` can be anything that's not a hyper:// URL or look like a domain name
    const drive = Hyperdrive('example')

    // Before using functions of the drive,
    // It's good to wait for it to fully load
    // However, most async functions can be used right away
    await drive.ready()

    // Here's how you can generate a hyper URL for a drive
    const url = `hyper://${drive.key.toString('hex')}`

    console.log('Drive ready', { url })

    // You can use a file path and some data to write a file
    await drive.writeFile('/example.txt', 'Hello World!')

    console.log('Wrote to drive')

    // You can use readFile to get the content back
    // By default it will read content as raw buffers
    console.log('Read from drive', await drive.readFile('/example.txt'))

    // You can read it as text too
    console.log('As text:', await drive.readFile('/example.txt', 'utf8'))

    // An error gets thrown if you try to read something that doesn't exist
    try {
      await drive.readFile('/nothing.txt')
    } catch (e) {
      console.error(e.message)
    }

    // You can create folders to group files together
    await drive.mkdir('/posts')

    console.log('Created `posts` folder')

    // You can write files to a folder using the right path
    await drive.writeFile('/posts/one.md', '# Hello')
    await drive.writeFile('/posts/two.md', '# World')

    const posts = await drive.readdir('/posts')

    console.log('Inside the posts folder', { posts })

    // You can get info about a path using `stat`
    const stats = await drive.stat('/example.txt')
    console.log('Stats about example text', stats[0])

    // You can stop seeding the Hyperdrive by closing it
    await drive.close()

    console.log('Closed')
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
