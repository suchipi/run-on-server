/* @flow */
const createCreateSocketUrl = require("./createCreateSocketUrl");
import type { SocketRegistry } from "~types";

module.exports = function wrapRequireForSocket(
  requireFunction: typeof require,
  requestUrl: URL,
  socketRegistry: SocketRegistry
): typeof require {
  return Object.assign(function require(source) {
    if (source === "run-on-server/socket") {
      return createCreateSocketUrl(requestUrl, socketRegistry);
    } else {
      return requireFunction.apply(this, arguments);
    }
  }, requireFunction);
};
