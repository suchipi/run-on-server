# `examples/prototyping`

This example shows how to generate an API using `babel-plugin-run-on-server`. The build is done as a separate step and id mappings are written to `dist/idMappings.js` and then included in the `require("./idMappings")` in `src/server.js` (which gets copied to `dist/server.js`).

Configured this way, the server will NOT execute any code given to it, only the code that is found in its idMappings file. Therefore, it is suitable for production use. You can open your console and try to use the global `runOnServer` function to execute arbitrary code; you will note it no longer works.

To run the example:

* Run `yarn install`
* Run `yarn build`
* Run `yarn server` in one terminal
* Run `yarn client` in another terminal
* Open `http://localhost:8080`
* Re-run `yarn build` and restart the server whenever you make a change.
