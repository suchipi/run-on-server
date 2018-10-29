/* @flow */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const stripAnsi = require("strip-ansi");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");
const handleRequest = require("./handleRequest");
const handleConnection = require("./handleConnection");
import type {
  // eslint-disable-next-line no-unused-vars
  $Request,
  $Response,
} from "express";
import type { ServerConfig, APIRequest, APIResponse } from "~types";

module.exports = function createServer(
  serverConfig: ?ServerConfig
): net$Server {
  const socketRegistry = new Map();
  const app = express();
  app.use(bodyParser.json());

  if (serverConfig == null || serverConfig.cors !== false) {
    app.use(cors());
    app.options("*", cors());
  }

  app.post(
    "/",
    (req: { /* :: ...$Request, */ body: APIRequest }, res: $Response) => {
      const requestUrl = url.parse(
        // $FlowFixMe
        req.protocol + "://" + req.get("Host") + req.originalUrl
      );

      handleRequest(
        req.body,
        serverConfig,
        // $FlowFixMe
        requestUrl,
        socketRegistry
      )
        .then((result) => {
          res.status(200).send(
            ({
              success: true,
              result: typeof result === "undefined" ? null : result,
            }: APIResponse)
          );
        })
        .catch((err: Error) => {
          res.status(500).send(
            ({
              success: false,
              err: {
                name: stripAnsi(err.name),
                message: stripAnsi(err.message),
                stack: stripAnsi(err.stack),
                code: err.code,
              },
            }: APIResponse)
          );
        });
    }
  );

  const server = http.createServer(app);

  const wsServer = new WebSocket.Server({ server });

  wsServer.on("connection", (socket, request) => {
    handleConnection(socket, request, socketRegistry);
  });

  return server;
};
