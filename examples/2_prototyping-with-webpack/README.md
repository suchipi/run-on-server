# `examples/prototyping`

This example shows how to use run-on-server for local prototyping using webpack. Both the server and client are loaded via the npm package, and the client is compiled using webpack.

In order to avoid bundling serverside dependencies in the clientside build, the run-on-server babel plugin is used with `evalRequire` turned on. This replaces all instances of `require` inside of `runOnServer` calls with `eval("require")`.

Configured this way, the server will execute any code given to it and is unsuitable for use in production. You can open your console and use the global `runOnServer` function to try executing arbitrary code.

To run the example:

* Run `yarn install`
* Run `yarn server` in one terminal
* Run `yarn client` in another terminal
* Open `http://localhost:8080`
