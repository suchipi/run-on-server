const compile = require("babel-plugin-run-on-server/dist/util/compile");

module.exports = (code) =>
  compile(code, { idMappingsEnabled: true, evalRequireEnabled: false });
