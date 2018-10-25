# `examples/1_prototyping`

This example shows how to use run-on-server for local prototyping. The server is loaded via the npm package and the client is loaded using the UMD build from the npm package via a CDN.

A server is created in `src/server.js` and then used in `src/client.js`.

Configured this way, the server will execute any code given to it and is unsuitable for use in production. You can open your console and use the global `runOnServer` function to try executing arbitrary code.

To run the example:

* Run `yarn install`
* Run `yarn server` in one terminal
* Run `yarn client` in another terminal
* Open `http://localhost:8080`
