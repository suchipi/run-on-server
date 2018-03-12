/* @flow */
const createCreateSocket = require("./createCreateSocket");
import type { SocketRegistry } from "~types";

module.exports = function wrapRequireForSocket(
  requireFunction: typeof require,
  requestUrl: URL,
  socketRegistry: SocketRegistry
): typeof require {
  return Object.assign(function require(source) {
    if (source === "run-on-server/createSocket") {
      return createCreateSocket(requestUrl, socketRegistry);
    } else {
      return requireFunction.apply(this, arguments);
    }
  }, requireFunction);
};
