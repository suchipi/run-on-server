/* @flow */
import fetchJSON from "./fetchJSON";
import type { APIResponse, RunOnServer } from "~types";

module.exports = function createClient(url: string): RunOnServer {
  function makeBody(
    code: Function | string | { id: string },
    args: ?Array<any>
  ) {
    if (typeof code === "function") {
      return {
        functionString: code.toString(),
        args,
      };
    } else if (typeof code === "string") {
      return {
        codeString: code,
        args,
      };
    } else if (
      typeof code === "object" &&
      code != null &&
      typeof code.id === "string"
    ) {
      return {
        codeId: code.id,
        args,
      };
    } else {
      throw new Error(
        "Expected either a function, string, or code id, but received: " +
          typeof code
      );
    }
  }

  function handleResponse(response: APIResponse) {
    if (response.success) {
      return response.result;
    } else {
      const error = new Error();
      Object.defineProperty(error, "name", {
        writable: true,
        enumerable: false,
        configurable: true,
        value: response.err.name,
      });
      Object.defineProperty(error, "message", {
        writable: true,
        enumerable: false,
        configurable: true,
        value: response.err.message,
      });
      Object.defineProperty(error, "stack", {
        writable: true,
        enumerable: false,
        configurable: true,
        value: response.err.stack,
      });

      throw error;
    }
  }

  function runOnServer(
    code: Function | string | { id: string },
    args: ?Array<any>
  ) {
    const body = makeBody(code, args);
    return fetchJSON("POST", url, body).then(handleResponse);
  }

  runOnServer.sync = function sync(
    code: Function | string | { id: string },
    args: ?Array<any>
  ) {
    const body = makeBody(code, args);
    const response = fetchJSON("POST", url, body, true);
    return handleResponse(response);
  };

  return runOnServer;
};
