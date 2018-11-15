# run-on-server

`run-on-server` provides a way to run arbitrary JavaScript code from a client (browser, node, etc) on a remote server (node) via HTTP.

## Usage

serverside:

```js
const createServer = require("run-on-server/server");

const app = createServer();
// createServer returns a node http.Server

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
```

clientside:

```js
const createClient = require("run-on-server/client");

const runOnServer = createClient("http://localhost:3000");

// You can pass a function...
runOnServer(() => {
  // This code gets executed server-side in the global context
  console.log(process.version);
});

// ...or a string:
runOnServer(`console.log(process.version)`);

// runOnServer returns a Promise:
runOnServer(() => {
  return 4;
}).then((response) => {
  console.log(response); // 4
});

// You can pass arguments in as a second argument:
runOnServer(
  (a, b) => {
    return a + b;
  },
  [3, 4]
).then((response) => {
  console.log(response); // 7
});

// When using a string, you can access passed arguments via the "args" variable:
runOnServer("console.log(args)", [1, 2, 3]); // Server logs [1, 2, 3]

// Async functions are also supported:
runOnServer(async () => {
  const value = await Promise.resolve(55);
  return value + 2;
}).then((response) => {
  console.log(response); // 57
});

// You can use `runOnServer.sync` for Synchronous XHR:
const result = runOnServer.sync("2 + 2");
console.log(result); // 4
```

## Limitations

* JSON is used as the transport mechanism. As such, the return value from the server and any arguments passed from the client must be JSON-serializable.
* When passing a function to `runOnServer`, the function source code is executed as-is server-side. This means that if you attempt to reference any local variables from the client in the function, the server will not be able to see them. To work around this, pass local variables in as function arguments via `runOnServer`'s second argument.

## Warnings / Security

Out of the box, this effectively gives the client serverside `eval`. However, there's a babel plugin that will restrict the server so that it will only run the code that appeared in your source at compile-time. For more info, read the [README for babel-plugin-run-on-server](https://github.com/suchipi/run-on-server/blob/master/packages/babel-plugin/README.md)

## Installation

With npm:

```
npm install run-on-server
```

or with yarn:

```
yarn add run-on-server
```

## JS API Documentation

### `createServer(options: ?Object) => http.Server`

The `createServer` function is obtained from the module `run-on-server/server`. When called, it returns a node [http.Server](https://nodejs.org/dist/latest/docs/api/http.html#http_class_http_server) configured to respond to JSON HTTP `POST`s on `/`. You can call its `listen` method to run it on an HTTP port or Unix Socket.

```js
const createServer = require("run-on-server/server");

const app = createServer();
```

#### `options`

The optional `options` object that can be passed to `createServer` has this shape:

```js
{
  requireFrom?: string,
  idMappings?: { [key: string]: Function | String },
  cors?: boolean,
  requestSizeLimit?: string,
}
```

If `requireFrom` is present, it will specify the starting folder for top-level `require` calls in the code passed to `runOnServer`. For instance, If you set `requireFrom` to "/Users/suchipi/Code/run-on-server", then you would be able to load "/Users/suchipi/Code/run-on-server/foo.js" with `require("./foo")`. If you don't specify a `requireFrom`, it will default to the server's current working directory.

`idMappings` is used in conjunction with a babel plugin to restrict the server so that it can only run code that appeared in your source. For more info, see the [README for babel-plugin-run-on-server](https://github.com/suchipi/run-on-server/blob/master/packages/babel-plugin/README.md).

The server will allow CORS requests from all origins by default. To override this behavior, pass `cors` as `false.`

When the server parses the incoming JSON from a request, it keeps all the bytes in memory. For safety reasons (to prevent high memory usage), a limit can be configured, and if a request that is too large comes through, the server wil reject the request. The limit is configured as `"1GB"` by default, but you can pass `requestSizeLimit` to change it. You can pass any string that can be parsed by the npm [bytes](https://www.npmjs.com/package/bytes) package, eg. `"100kb"`, `"2MB"`, etc (unit is case-insensitive).

### `createClient(url: string) => Function`

The `createClient` function is obtained from the module `run-on-server/client`. When called, it returns a `runOnServer` function configured with the specified url.

```js
const createClient = require("run-on-server/client");

const runOnServer = createClient("http://localhost:3000");
```

### `runOnServer(code: Function | string, args: ?Array<any>) => Promise<any>`

The `runOnServer` function is obtained by calling `createClient`. It can be called with either a function or string, and an optional array of arguments to pass to the function (when using a function). It returns a Promise.

```js
runOnServer(`console.log("hello, world!")`);

runOnServer(() => {
  return 5;
}).then((response) => {
  console.log(response); // 5
});

runOnServer(async () => {
  const someNumber = await Promise.resolve(62);
  return someNumber + 5;
}).then((response) => {
  console.log(response); // 67
});

runOnServer(
  (one, two, three) => {
    return one + two + three;
  },
  [1, 2, 3]
).then((response) => {
  console.log(response); // 6
});

// You can access the passed args in the string form via the `args` variable.
runOnServer(`args.map(x => x * 2)`, [1, 2, 3]).then((response) => {
  console.log(response); // [2, 4, 6]
});
```

* If the function or code string passed to `runOnServer` returns a value, it must be JSON-serializable.
* If an arguments array is passed in as the second argument to `runOnServer`, it must be JSON-serializable.
* If the serverside code throws an Error, the Promise returned from `runOnServer` will reject with an Error with the same name, message, and stack as the serverside error.

### `runOnServer.sync(code: Function | string, args: ?Array<any>) => any`

`runOnServer.sync` works just like `runOnServer` but it uses a Synchronous XHR instead of an async one, so it blocks the main thread until the server responds, and then returns the result.

```js
const result = runOnServer.sync(() => {
  return 2 + 2;
});
console.log(result); // 4
```

### `createSocketUrl(handler: Function) => string`

You can require `run-on-server/socket` within a `runOnServer` or `runOnServer.sync` call to get the `createSocketUrl` function. It lets you set up a websocket server, and returns a URL that you can connect to clientside to connect to that server:

```js
runOnServer(() => {
  const createSocketUrl = require("run-on-server/socket");

  return createSocketUrl((socket) => {
    socket.on("message", (data) => {
      // Simple echo server.
      socket.send(data);
    });
  });
}).then((socketUrl) => {
  console.log(socketUrl); // An autogenerated URL, like ws://localhost:3001/dj37h5las01nfue
  const socket = new WebSocket(socketUrl);
  socket.addEventListener("open", () => {
    socket.send("hello");
  });
  socket.addEventListener("message", (event) => {
    console.log(event.data);
  });
  // "hello" is sent from the client to the server,
  // then echoed back and logged on the client.
});
```

`createSocketUrl` should be called with a handler function. The handler function receives a websocket as its first argument, and the request object for the connection as its second argument.

Note: After the client disconnects, the generated URL will no longer be valid. Re-run the `runOnServer` call to generate a new one before reconnecting.

## Related Work

`run-on-server` was inspired by [karma-server-side](https://github.com/featurist/karma-server-side).
