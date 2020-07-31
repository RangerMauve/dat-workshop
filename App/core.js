const EventEmitter = require('events')

// We're going to hardcode a peer discovery key
// It's a 64 character hex string like all Hyper URLs
// You'll usually want to make this configurable at the app level
const KEY = 'BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD'

// I like to export async functions that initialize my class from options
module.exports = async function createExampleApp (sdk) {
  const app = new ExampleAppCore(sdk)

  await app.init()

  return app
}

// OOP can be gross, but classes aren't all bad when used sparingly
class ExampleAppCore extends EventEmitter {
  // We're going to enable passing in the SDK from outside the core
  // This way the core doesn't worry about how those APIs get there
  constructor ({ Hypercore }) {
    super()
    this.Hypercore = Hypercore

    // We'll keep a list of all the peer keys we've seen so far
    // We'll send this to any new peers we see
    this.knownPeers = new Set()

    this.writeCore = null
    this.discoveryCore = null
    this.ext = null
  }

  // We usually need async stuff for initializing, which can't be done in the constructor
  // That's why I like to have an async init method
  async init () {
    // We'll create a local hypercore for storing out messages
    this.writeCore = this.Hypercore('my_messages', {
      // We don't care about fancy data encoding, so we'll use JSON
      valueEncoding: 'json'
    })

    // This Hypercore is used for finding peers for a key and exchanging extensions
    // It doesn't actually contain data
    this.discoveryCore = this.Hypercore(KEY)

    // Here we'll register an extension type to use for peer discovery
    this.ext = this.discoveryCore.registerExtension('workshop-peer-discovery', {
      encoding: 'json',
      onmessage: (message, peer) => this.onmessage(message, peer),
      onerror: (e) => this.emit('error', e)
    })

    // Whenever we get a new peer, we'll want to send them our keys
    this.discoveryCore.on('peer-open', (peer) => this.onpeer(peer))

    // We'll start watching for messages from ourselvs same as others
    await this.watchCore(this.writeCore)
  }

  listKnownKeys () {
    return [...this.knownPeers]
  }

  // We'll handle listening for changes in cores in one place
  async watchCore (core) {
    const { key } = core

    const keyString = key.toString('hex')

    // If we've already seen this core, ignore it
    if (this.knownPeers.has(keyString)) return

    // Tell the rest of the app we have a new peer
    this.emit('found', core)

    // Track this peer for later
    this.knownPeers.add(keyString)

    // This will loop by waiting for the hypercore to update
    // Then it will get the latest data, and then it will loop again
    const loadNext = async () => {
      const data = await core.head()
      const { type } = data

      // Emit every new message to the app
      this.emit(type, data, core)

      // This will wait for the next update
      core.update(loadNext)
    }

    // Start the loop
    core.update(loadNext)
  }

  // This is a public API for writing a message to send to other peers
  async write (message) {
    const timestamp = Date.now()
    const type = 'message'

    // We append all new messages to our hypercore
    await this.writeCore.append({
      timestamp,
      type,
      message
    })
  }

  // Called on every new extension message
  // Finds new cores that peers have and watches them
  async onmessage (message, peer) {
    const { type } = message

    if (type === 'bootstrap') {
      const { keys: remoteKeys } = message
      // We'll ignore any keys we already know about
      const newKeys = remoteKeys
        .filter((key) => !this.knownPeers.has(key))

      // If we already know all their keys, don't do anything
      if (!newKeys.length) return

      // For each new core, load it and start watching for changes
      for (const key of newKeys) {
        const core = this.Hypercore(key, { eagerUpdate: true, valueEncoding: 'json' })

        await this.watchCore(core)
      }

      // We should send our full list of keys with new peers to everyone
      this.ext.broadcast({
        type: 'bootstrap',
        keys: this.listKnownKeys()
      })
    }
  }

  // Whenever we get a new peer, send them all the keys we know
  async onpeer (peer) {
    this.ext.send({
      type: 'bootstrap',
      keys: this.listKnownKeys()
    }, peer)
  }
}
