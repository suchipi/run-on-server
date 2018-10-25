const createClient = require("run-on-server/client");

const runOnServer = createClient("http://localhost:3001");

runOnServer(() => {
  const fs = require("fs");
  return fs.readFileSync("./package.json", "utf-8");
}).then((pkgJson) => {
  const pre = document.createElement("pre");
  pre.innerText = pkgJson;
  document.body.appendChild(pre);
});
