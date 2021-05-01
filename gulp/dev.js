const log = require("fancy-log");
const { runScript } = require("./toolkit");

function tsc() {
  const compiler = runScript("tsc", ["--watch"]);
  compiler.stdout.on("data", (data) => {
    log(`[TypeScript] ${data.toString().trim()}`);
  });
  compiler.stderr.on("data", (data) => {
    log.error(`[TypeScript] ${data.toString().trim()}`);
  });
  compiler.on("close", (code) => {
    log(`TypeScript Watcher process exited with code ${code}`);
    return;
  });
}

function electron() {
  const electron = runScript("electron", [".", "--remote-debugging-port=9222"]);
  electron.stdout.on("data", (data) => {
    log(`[Electron] ${data.toString().trim()}`);
  });
  electron.stderr.on("data", (data) => {
    log.error(`[Electron] ${data.toString().trim()}`);
  });
  electron.on("close", (code) => {
    log(`Electron process exited with code ${code}`);
    return;
  });
}

module.exports = function () {
  tsc();
  setTimeout(electron, 8000);
};
