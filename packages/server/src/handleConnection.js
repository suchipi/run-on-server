/* @flow */
import type { SocketRegistry } from "~types";

module.exports = function handleConnection(
  socket: WebSocket & {
    on: (string, (any) => void) => void,
  },
  request: any,
  socketRegistry: SocketRegistry
) {
  const url = request.url.slice(1); // remove leading '/'
  socket.on("close", () => {
    socketRegistry.delete(url);
  });
  socket.on("error", () => {
    socketRegistry.delete(url);
  });

  try {
    const handler = socketRegistry.get(url);
    if (handler != null) {
      handler(socket, request);
    } else {
      socket.close(4404, "No websocket handler is registered for that URL.");
    }
  } catch (err) {
    // According to RFC6455, a WebSocket control frame must be 125 bytes or
    // smaller, and in a Close control frame, the first two bytes are the
    // status code (in this case, 4500). That leaves 123 bytes left for the
    // reason string.
    const maxReasonSize = 123;
    socket.close(
      4500,
      err.stack.replace(/\n {4}at/g, "\nat").slice(0, maxReasonSize)
    );
  }
};
