import fs from "fs";
import prettier from "prettier";

const version = process.argv[2];
const pkgFile = "./package.json";
const confFile = "./src-tauri/tauri.conf.json";

const options = await prettier.resolveConfig("./prettierrc.js");
options.parser = "json";

const pkg = JSON.parse(fs.readFileSync(pkgFile));
pkg.version = version;
fs.writeFileSync(pkgFile, await prettier.format(JSON.stringify(pkg), options));

const conf = JSON.parse(fs.readFileSync(confFile));
conf.package.version = version;
fs.writeFileSync(
  confFile,
  await prettier.format(JSON.stringify(conf), options)
);

console.log(`Updated version name to '${version}'!`);
