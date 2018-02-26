const createServer = require("run-on-server/server");
const idMappings = require("../dist/idMappings");

const server = createServer({
  requireFrom: __dirname,
  idMappings,
});

server.listen(3002, () => {
  console.log("server is listening on port 3002");
});
