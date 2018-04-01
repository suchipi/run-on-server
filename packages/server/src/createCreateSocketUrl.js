/* @flow */
const uid = require("uid");
import type { SocketRegistry } from "~types";

module.exports = function createCreateSocketUrl(
  requestUrl: URL,
  socketRegistry: SocketRegistry
) {
  return function createSocketUrl(handler: (socket: WebSocket) => void) {
    const socketId = uid(15);
    socketRegistry.set(socketId, handler);
    let protocol = "ws:";
    if (requestUrl.protocol === "https:") {
      protocol = "wss:";
    }
    return `${protocol}//${requestUrl.host}/${socketId}`;
  };
};
