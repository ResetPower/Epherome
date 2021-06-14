const childProcess = require("child_process");

const wds = childProcess.spawn("npm", ["run", "serve"], {
  shell: false,
  stdio: [0, 1, 2],
});

const exit = () => {
  wds.kill();
  process.exit(-process.pid);
};

setTimeout(() => {
  const electron = childProcess.spawn("npm", ["run", "electron"], {
    shell: false,
    stdio: "inherit",
  });

  electron.on("exit", exit);
}, 4000);

process.on("beforeExit", exit);
