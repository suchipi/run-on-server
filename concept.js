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
    // a WebSocketID object. The serverside code notices this WebSocketID object,
    // sets up a websocket endpoint that will call the callback passed to
    // createSocket (when the client connects), and then returns something like
    // { __websocketURL: "ws://localhost:3001/f4n983vpy6t584u85j9" }
    // to the client. NOTE: returning eg. { socket, foo: 5 } or [socketA, socketB]
    // should be supported (using JSON replacer/reviver).
  },
  ["irc://url"]
).then(
  // The client code notices the __websocketURL property and constructs a
  // WebSocket pointed to the associated URL. It does not open it, that's up to
  // the user.
  (socket) => {
    socket.addEventListener("open", () => console.log("connected"));

    socket.addEventListener("message", (data) => {
      // do something with the response
    });

    socket.open();
    socket.write("hello");
  }
);
