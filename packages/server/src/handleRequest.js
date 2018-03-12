/* @flow */
const createFakeModuleEnvironment = require("./createFakeModuleEnvironment");
const parseRequest = require("./parseRequest");
const compileCode = require("./compileCode");
const wrapRequireForSocket = require("./wrapRequireForSocket");
import type { APIRequest, ServerConfig, SocketRegistry } from "~types";

module.exports = function handleRequest(
  requestBody: APIRequest,
  serverConfig: ?ServerConfig,
  requestUrl: URL,
  socketRegistry: SocketRegistry
): Promise<mixed> {
  return new Promise((resolve, reject) => {
    const idMappings = serverConfig && serverConfig.idMappings;
    const { code, args } = parseRequest(requestBody, idMappings);
    const runCode = compileCode(code, args);

    const requireFrom = serverConfig && serverConfig.requireFrom;
    const env = createFakeModuleEnvironment(requireFrom);

    env.require = wrapRequireForSocket(env.require, requestUrl, socketRegistry);

    const result = runCode(env);
    resolve(result);
  });
};
