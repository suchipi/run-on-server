const Module = require("module");
const path = require("path");
const makeRequireFunction = require("./makeRequireFunction");

module.exports = function makeModuleEnv(filename: string) {
  if (!path.isAbsolute(filename)) {
    throw new Error("makeModuleEnv requires an absolute path");
  }

  const dirname = path.dirname(filename);

  const mod = new Module(".", null);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(filename);

  const req = makeRequireFunction(mod);
  req.main = mod;

  const exps = {};
  mod.exports = exps;

  return {
    exports: exps,
    require: req,
    module: mod,
    __filename: filename,
    __dirname: dirname,
  };
};
