# dat-workshop
A workshop for learning about dat-sdk and how to build p2p applications with it.

Follow along with the README and go through the examples 

## 1. Why 🤔

When I started looking into Dat there was a mix of ways to build with it.
The Dat CLI tool was there as a way to sync folders with a "Dat Archive" and back, and was a batteries-included sort of deal.
Beaker had their own APIs for interacting with Dat which was different from the CLI.
Other apps would end up rolling their own way of using all the underlying pieces and would often be repeating the same code.
One thing that was hard was that the usage of Dat would be tightly coupled to the environment the app was running in, so porting to the web involved custom gateways and code changes.
I decided to try to put together a Software Development Kit which exposed the higher level Dat data structures, but which abstracted away some of the details of the networking and storage so that code could target the data structures and could be portable across different environments.
Under the hood, the SDK uses both node.js and web implementations of networking and storage libraries and automatically loads whichever one is most appropriate at runtime.
Since we're looking at how to use SDK, we'll gloss over the underlying details and focus more on the tools we have available to us.

## 2. Setup 🛠️

Before we get started with the rest of the workshop, we'll need to make sure our environment is set up.

We'll need the following installed:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/)
- Some sort of code editor (Like [Visual Studio Code](https://code.visualstudio.com/))

Once you've got all the dependencies set up, open up a terminal (or command prompt or whatever) and get a copy of this repository:

```
git clone git@github.com:RangerMauve/dat-workshop.git
cd ./dat-workshop
npm install
```

From here we have folders for the various sections of the workflow.

Open up the `Hyperdrive` folder to started.

## 4. Hyperdrive 📂

Hyperdrive is a peer to peer filesystem.
You can create a drive, shove some files into it, and then load it on another computer (a peer).
Updates to a drive can be seen in any peers that are loading it.
You can load data for a drive from any peer who has it, so the more peers have the data, the more the load is distributed.

Next we'll go over some examples of using Hyperdrive with the SDK.
You'll want to look at each example and try running them with the `node` binary.
I'd suggest adding `console.log()` statements places to see what's going on.

### 4.1 Create a named drive 🆕

This goes over some basic setup and shows you how to create and modify a Hyperdrive.

### 4.2 Load someone's drive 📩

This goes over loading a drive on another peer and how to load data from it.

### 4.3 Watch for changes ⌚

This goes over how you can watch for changes in a drive to run code whenever there's a new file or deletion.

### 4.4 DNS resolution

This goes over resolving DNS names to keys using dat-dns.

## 5. Hypercore 🌳

Hypercore is the underlying data strucuture that fuels Hyperdrive.
It's what we call an "append only log", which is kinda like a blockchain but local-first.
You can add data to it in "chunks" and load chunks by their index.

Like before, check out the following files for examples of using Hypercore.

### 5.1 Create a named core 🆕

This goes over initializing a Hypercore and writing data to it.

### 5.2 Load a created core 📩

This goes over loading a Hypercore over the network.

## 6. Extension Messages ✉️

Hypercore-protocol consists of sending messages over a connection to a peer to exchange P2P data.

A neat feature of it is that you can send custom messages over existing connections.

This is called "extension messages".

You can register an extension message on either a Hypercore, Hyperdrive, or globally on all connections.

These examples will walk you through using extension messages yourself.

### 6.1 Extension types 💬

This example will go over the three ways of registering extension messages in the SDK and how to send them out.

### 6.2 Using an extension library 📚

This example will showcase the hyper-flood extension message library and show how you can use it with the SDK.

## 7 Building apps 📦

Next we'll go over some of the things you need to know when building and deploying apps.

### 7.1 Node.js

Node.js is the easiest platform to target, we've been using it this whole time!

You'll want to keep the following in mind when you're developing libraries or modules:

- Make sure `dat-sdk` is in your dependencies
- Your library users will likely need to set up `node-gyp`
- If you have a library, give users the ability to pass an SDK instance
- If you have an app, expose SDK configuration options

Check out `./Build/node.js` for an example of what a library might look like.

### 7.2 Electron

Electron is essentially Node.js with Chromium glued on, as such most tips for Electron apply here too.

With electron there's two ways to use the SDK, in the main process, and inside the renderer process.

In the main process, it's the same as in Node.js, require the SDK, and go to town.

In the renderer process, you have two ways of doing things.

You can either wrap all the SDK stuff inside some sort of API that the renderer process uses, or use electron's `remote` API to load the SDK directly in the renderer process. You should be 

You can see an example of using the `remote` API in `./Building/electron-renderer.html` 

One thing you should consider with Electron, is how you will compile your code into bundles.

The native dependencies in Dat-SDK use precompiled builds so you likely won't want to recompile for electron when building.

I've had great experiences using electron-builder in my projects with the following build flags:

```js
"build": {
  "npmRebuild": false,
  "asar": true    
}
```

You can check out the build config in [Agregore](https://github.com/RangerMauve/agregore-browser/blob/master/package.json) to see what worked there.

On top of that, it's been useful to run the build on Travis CI since building binaries across platforms can be difficult.

I've been using Travis CI for automatically building releases of electron apps whenever a new release gets tagged.

You can check out the Travis config in [Agregore](https://github.com/RangerMauve/agregore-browser/blob/master/.travis.yml) for a place to get started on your own automated builds.

### 7.3 Web (Browserify)

Browserify is my favorite way of bundling stuff on the web because it handles node modules cleanly.

With Browserify, you'll want all your JS code to follow node.js conventions with `require` and `module.exports`.

Then you can set up a Browserify build step for your code with the following steps:

- Install browserify `npm i --save-dev browserify`
- Add a build script to your package.json `browserify ./ > bundle.js`
- This will generate a `bundle.js` file which has all your content
- You should include this bundle in an HTML `<script>` tag.

Internally, Browserify is passing everything in the SDK through [a Babel config](https://github.com/datproject/sdk/blob/master/babel.config.json) which replaces various "native" modules with modules that work on the web.

### 7.4 Web (Webpack)

These days, Browserify isn't as popular and Webpack is the cool kid on the block.

Getting the SDK working with Webpack will require some aliasing in your Webpack config.

Here's an example of a config that worked for me:

```js
const path = require('path')

module.exports = {
  entry: './index.js',
  target: 'web',
  resolve: {
    alias: {
      fs: 'graceful-fs',
      'sodium-native': '@geut/sodium-javascript-plus',
      'sodium-universal': '@geut/sodium-javascript-plus',
      hyperswarm: 'hyperswarm-web',
      util: './node_modules/util/util.js'
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
}
```

The main bits are where it aliases native modules to pure JS / Browser versions.

You may need to install some additional modules like `stream` and `util` to make sure everything works.

## 8. Example App

Now we'll put some of this stuff together into an example app that works in Electron and Node.js

### 8.1 Core

First we'll put together the `core` of our application logic.

This is useful for decoupling your data and raw interaction away from the user interface or interface to other apps.

It's kinda like turning your app into a reusable library before figuring out the rest of it.

This is similar to how in a cloud based app you'd put together your server APIs before your front end can load data.

We'll make a basic chat app with automatic peer discovery and data loading

Check out ./App/core.js for the example app core code.

### 8.2 CLI

Since front end code is hard, we'll start by mocking up a basic command line interface.

Our interface will use the core library and output messages from it to the terminal and send lines of text as messages

This logic is held inside ./App/cli.js.

### 8.3 Electron UI

Now we'll mock up an Electron based UI since everyone needs fancy graphical frontends these days.

We'll have a basic text output for seeing people's messages, and a text input in a form for sending messages.

The logic for the electron 'main' process is in ./App/electron.js and the front end code is in ./App/electron.html

The other examples could be run with node, this one we'll run with electron with `npm run run-example-app`
