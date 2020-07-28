# dat-workshop
A workshop for learning about dat-sdk and how to build p2p applications with it.

## Why 🤔

When I started looking into Dat there was a mix of ways to build with it.
The Dat CLI tool was there as a way to sync folders with a "Dat Archive" and back, and was a batteries-included sort of deal.
Beaker had their own APIs for interacting with Dat which was different from the CLI.
Other apps would end up rolling their own way of using all the underlying pieces and would often be repeating the same code.
One thing that was hard was that the usage of Dat would be tightly coupled to the environment the app was running in, so porting to the web involved custom gateways and code changes.
I decided to try to put together a Software Development Kit which exposed the higher level Dat data structures, but which abstracted away some of the details of the networking and storage so that code could target the data structures and could be portable across different environments.
Under the hood, the SDK uses both node.js and web implementations of networking and storage libraries and automatically loads whichever one is most appropriate at runtime.
Since we're looking at how to use SDK, we'll gloss over the underlying details and focus more on the tools we have available to us.

## Tools 🛠️

### Hyperdrive 📂

#### Create a named drive 🆕

#### Load a created drive 📩

#### Watch for changes ⌚

### Hypercore 🌳

#### Create a named core 🆕

#### Load a created core 📩

#### Value Encodings 🔃

### Extension Messages ✉️

#### Key gossip extension 💬

#### Using an extension library 📚

## Building apps 📦

### Node.js

### Electron

### Browserify (Web)

## Hello World Chat App 👋

### Core gossip / chat

### CLI UI 

### Web UI
