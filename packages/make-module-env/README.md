# make-module-env

Create `exports`, `module`, `require`, `__filename`, and `__dirname` variables for any path

## Usage

```js
const makeModuleEnv = require("make-module-env");

const { exports, module, require, __filename, __dirname } = makeModuleEnv(
  "/Users/suchipi/Code/my-project/index.js"
);

// Use as normal
require.resolve("./package.json"); // resolves to /Users/suchipi/Code/my-project/package.json if it exists
```

## API Documentation

This module exports one function, `makeModuleEnv`. It should be called with the absolute path to a file, and it will return an object with `exports`, `module`, `require`, `__filename`, and `__dirname` properties that behave like the ones node would provide to that file. Note that the file at the path passed in does not need to exist, only the directories leading up to that file. So you can use eg. `path.resolve(__dirname, "fake-file.js")`.

## License

MIT
