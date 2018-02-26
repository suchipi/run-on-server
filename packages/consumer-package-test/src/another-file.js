const createClient = require("run-on-server/client");

const runOnServer = createClient("http://localhost:3001");

runOnServer(() => {
  console.log("hello from another-file");
});
