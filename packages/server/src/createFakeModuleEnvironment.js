/* @flow */
const makeModuleEnv = require("make-module-env");
const path = require("path");
import type { ModuleEnvironment } from "~types";

module.exports = function createFakeModuleEnvironment(
  requireFrom: ?string
): ModuleEnvironment {
  if (requireFrom && requireFrom[requireFrom.length - 1] === path.sep) {
    // Trim off trailing slash
    requireFrom = requireFrom.slice(0, -1);
  }
  const dirname = requireFrom || process.cwd();
  const filename = path.join(dirname, "this-file-doesnt-actually-exist.js");

  return makeModuleEnv(filename);
};
