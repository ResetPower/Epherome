const { execSync } = require("child_process");
const fs = require("fs");
const base = require("./webpack.base");

module.exports = ({ dev }) => {
  return {
    entry: {
      main: "./src/main",
    },
    target: "electron-main",
    ...base({ dev }, [
      {
        apply(compiler) {
          compiler.hooks.afterEmit.tap("AfterEmitPlugin", () => {
            console.log(">>> Building native, please wait...");
            execSync(`npm run build-native ${dev ? "" : "-- --release"}`);
            console.log("\n");
            fs.writeFileSync(
              "dist/preload.js",
              `window.native = require("./index.node");`
            );
          });
        },
      },
    ]),
  };
};
