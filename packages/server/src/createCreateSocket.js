/* @flow */
const uid = require("uid");
import type { SocketRegistry } from "~types";

module.exports = function createCreateSocket(
  requestUrl: URL,
  socketRegistry: SocketRegistry
) {
  const socketId = uid(15);

  return function createSocket(handler: (socket: WebSocket) => void) {
    socketRegistry.set(socketId, handler);
    let protocol = "ws:";
    if (requestUrl.protocol === "https:") {
      protocol = "wss:";
    }
    return `${protocol}//${requestUrl.host}/${socketId}`;
  };
};
