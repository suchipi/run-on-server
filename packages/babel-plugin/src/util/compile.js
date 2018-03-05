const path = require("path");
const fs = require("fs");
const babel = require("babel-core");
const rimraf = require("rimraf");
const plugin = require("..");

const macroPath = path.resolve(__dirname, "..", "..", "client.macro");
const outputPath = path.join(__dirname, "run-on-server-id-mappings.js");

const transform = (code, idMappingsEnabled, evalRequireEnabled) => {
  rimraf.sync(outputPath);
  const result = babel.transform(code, {
    plugins: [
      [
        plugin,
        {
          idMappings: { enabled: idMappingsEnabled, outputPath },
          evalRequire: { enabled: evalRequireEnabled },
        },
      ],
    ],
  });
  let output = "";
  if (fs.existsSync(outputPath)) {
    output = fs.readFileSync(outputPath, "utf-8");
    rimraf.sync(outputPath);
  }
  return {
    code: result.code,
    output,
  };
};

const compile = (code, options = {}) => {
  const { idMappingsEnabled = false, evalRequireEnabled = false } = options;

  delete require.cache[macroPath];
  return transform(code, idMappingsEnabled, evalRequireEnabled);
};

module.exports = compile;
