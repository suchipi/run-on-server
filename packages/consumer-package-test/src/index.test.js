const path = require("path");
const { exec, rm } = require("shelljs");

test("combines ids from multiple files into one idMappings file", () => {
  const babel = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "node_modules",
    ".bin",
    "babel"
  );
  rm(path.resolve(__dirname, "../dist/idMappings.js"));
  exec(`${babel} src -d dist --ignore *.test.js`);
  const idMappings = require("../dist/idMappings");
  expect(Object.keys(idMappings).length).toBe(2); // one from index, one from another-file
});
