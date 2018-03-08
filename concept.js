const createClient = require("run-on-server/client");
const runOnServer = createClient("http://localhost:3001");

runOnServer(
  (ircUrl) => {
    // run-on-server/createSocket doesn't actually exist; the require function
    // passed is patched to return a special function when you require that
    // specifically. NOTE: create a file named createSocket.js in the
    // run-on-server package that notes that this is a virtual module and throws
    // an error (in case someone tries to load that outside of a runOnServer call)
    const createSocket = require("run-on-server/createSocket");

    return createSocket((socket) => {
      socket.on("message", (data) => {
        // do something with the data
        socket.write("idk some irc thing?");
      });
    });
    // createSocket generates a unique ID for a websocket endpoint and returns
    // a URL that the client can connect a websocket to to execute the
    // callback passed to createSocket.
  },
  ["irc://url"]
).then((socketUrl) => {
  const socket = new WebSocket(socketUrl);
  socket.addEventListener("open", () => console.log("connected"));

  socket.addEventListener("message", (data) => {
    // do something with the response
  });

  socket.open();
  socket.write("hello");
});
