const Core = require('./core')
const SDK = require('dat-sdk')

// We'll be using this built in Node.js library for the UI
const readline = require('readline')

main()
  .catch((e) => process.nextTick(() => {
    throw e
  }))

async function main () {
  // Initialize the SDK and the core
  const sdk = await SDK({ persist: false })
  const core = await Core(sdk)

  // This lets us read text from the STDIN
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  // Listen on new messages and log them to the console
  core.on('message', ({ message, timestamp }, { key }) => {
    const when = new Date(timestamp).toTimeString()
    const who = key.toString('hex').slice(0, 4)
    console.log(`${who}:\t${when}\n\t${message}`)
  })

  // Listen on newly found peers and log them to the console
  core.on('found', ({ key }) => {
    const who = key.toString('hex').slice(0, 4)
    console.log(`New peer: ${who}`)
  })

  // For each line in STDIN, write it to the core
  for await (const line of rl) {
    readline.clearLine()
    core.write(line)
  }
}
