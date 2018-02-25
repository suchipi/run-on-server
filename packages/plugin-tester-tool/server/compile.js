const path = require("path");
const fs = require("fs");
const babel = require("babel-core");
const rimraf = require("rimraf");
const plugin = require("@run-on-server/transform/dist/plugin").default;

const macroPath = path.resolve(__dirname, "..", "..", "client.macro");
const outputPath = path.join(process.cwd(), "run-on-server-id-mappings.js");

const transform = (code) => {
  rimraf.sync(outputPath);
  const result = babel.transform(code, { plugins: [plugin] });
  const output = fs.readFileSync(outputPath, "utf-8");
  rimraf.sync(outputPath);
  return {
    code: result.code,
    output,
  };
};

const compile = (code) => {
  delete require.cache[macroPath];
  return transform(code);
};

module.exports = compile;
