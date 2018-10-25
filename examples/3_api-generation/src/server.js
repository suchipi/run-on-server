const createServer = require("run-on-server/server");

const server = createServer({ idMappings: require("./idMappings") });

server.listen(3001, () => {
  console.log("Server listening on port 3001");
});
