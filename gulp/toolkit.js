const { spawn } = require("child_process");

// run npm script
exports.runScript = function (name, args = []) {
  return spawn("npx", [name, ...args]);
};
