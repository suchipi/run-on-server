const createClient = require("run-on-server/client");

const runOnServer = createClient("http://localhost:3001");

global.runOnServer = runOnServer;

// eslint-disable-next-line no-undef
document.body.innerText = "Open your console and try out runOnServer";
