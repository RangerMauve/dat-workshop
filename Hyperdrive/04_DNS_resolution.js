// This example will show you:
// - How to resolve DNS names to a key
//
// Go to the root of the workshop folder and run:
// node ./Hyperdrive/04_DNS_resolution.js

const SDK = require('dat-sdk')
const sleep = require('delay')

// Dat-SDK makes use of JavaScript promises
// You'll usually want to use it from an async function
async function main () {
  // Wrap your code in try-catch to handle errors
  try {
    var {
      Hyperdrive,
      resolveName,
      close
    } = await SDK({
      persist: false
    })

    const key = await resolveName('blog.mauve.moe')

    console.log('Resovled blog.mauve.moe to', key)

    const drive = Hyperdrive(key)

    await sleep(3000)

    console.log('Loading content from resolved drive')
    console.log(await drive.readFile('/index.html', 'utf8'))

    await drive.close()
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
