const base = require("./webpack.base");

module.exports = ({ dev }) => {
  return {
    entry: {
      main: "./src/main",
    },
    target: "electron-main",
    ...base({ dev }),
  };
};
