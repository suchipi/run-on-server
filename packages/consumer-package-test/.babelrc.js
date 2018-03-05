const path = require("path");

module.exports = {
  plugins: [
    [
      "run-on-server",
      {
        idMappings: {
          enabled: true,
          outputPath: path.resolve(__dirname, "./dist/idMappings.js"),
        },
      },
    ],
  ],
};
