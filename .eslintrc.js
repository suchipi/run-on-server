module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false
  },
  extends: [
    "unobtrusive",
    "unobtrusive/flowtype",
    "unobtrusive/import",
    "unobtrusive/react",
  ],
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  settings: {
    "import/core-modules": ["~types"],
  },
};
