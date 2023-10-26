const path = require("path");
const fs = require("fs");
const { cd, rm, exec, mkdir } = require("shelljs");
const chalk = require("chalk");
const Case = require("case");
const packageJson = require("../package.json");

const bin = (name) =>
  path.resolve(__dirname, "..", "node_modules", ".bin", name);

const pkgsWithSrc = packageJson.workspaces
  .map((pkgPath) => {
    if (fs.existsSync(path.resolve(__dirname, "..", pkgPath, "src"))) {
      return pkgPath;
    } else {
      return null;
    }
  })
  .filter(Boolean);

pkgsWithSrc.forEach((pkgPath) => {
  console.log(chalk.blue(pkgPath));
  cd(path.resolve(__dirname, "..", pkgPath));
  mkdir("-p", "dist");
  rm("-rf", "dist/*");
  exec(`${bin("babel")} src -d dist --ignore *.test.js`);

  let umdBundleName = Case.pascal(pkgPath.replace(/^packages\//, ""));
  if (umdBundleName === "RunOnServer") {
    umdBundleName = "runOnServer";
  } else {
    umdBundleName = "runOnServer" + umdBundleName;
  }

  const rollupConfig = path.resolve(__dirname, "..", "rollup.config.mjs");

  exec(
    `${bin(
      "rollup"
    )} -c ${rollupConfig} dist/index.js --file dist/umd.js --format umd --name ${umdBundleName}`
  );
});
