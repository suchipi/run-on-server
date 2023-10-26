import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import builtinModules from "builtin-modules";

export default {
  external: builtinModules,
  plugins: [nodeResolve(), commonjs(), json()],
};
