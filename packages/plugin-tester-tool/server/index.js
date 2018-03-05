const createServer = require("run-on-server/server");

const server = createServer({ requireFrom: __dirname });

server.listen(3001, () => {
  console.log("App is listening on port 3001");
});
