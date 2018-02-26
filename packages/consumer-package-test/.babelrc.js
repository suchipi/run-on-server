const path = require("path");

module.exports = {
  plugins: [
    [
      "run-on-server",
      {
        outputPath: path.resolve(__dirname, "./dist/idMappings.js"),
      },
    ],
  ],
};
