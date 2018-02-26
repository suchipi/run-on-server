# run-on-server

`run-on-server` provides a way to run arbitrary JavaScript code from a client (browser, node, etc) on a remote server (node) via HTTP.

## Usage

serverside:

```js
const createServer = require("run-on-server/server");

const app = createServer();
// createServer returns an express app

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

### `createServer(options: ?Object) => ExpressApplication`

The `createServer` function is obtained from the module `run-on-server/server`. When called, it returns an [Express Application](http://expressjs.com/en/api.html#app) configured to respond to JSON HTTP `POST`s on `/`. You can call its `listen` method to run it on an HTTP port or Unix Socket, or you can pass it into another express app's `app.use` method to mount it at an arbitrary route. See the [Express documentation](http://expressjs.com/en/api.html#app) for more information.

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
}
```

If `requireFrom` is present, it will specify the starting folder for top-level `require` calls in the code passed to `runOnServer`. For instance, If you set `requireFrom` to "/Users/suchipi/Code/run-on-server", then you would be able to load "/Users/suchipi/Code/run-on-server/foo.js" with `require("./foo")`. If you don't specify a `requireFrom`, it will default to the server's current working directory.

`idMappings` is used in conjunction with a babel plugin to restrict the server so that it can only run code that appeared in your source. For more info, see the [README for babel-plugin-run-on-server](https://github.com/suchipi/run-on-server/blob/master/packages/babel-plugin/README.md).

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

## Related Work

`run-on-server` was inspired by [karma-server-side](https://github.com/featurist/karma-server-side).
