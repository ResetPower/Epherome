const path = require("path");

module.exports = {
  entry: {
    main: "./src/main/main.ts",
  },
  target: "electron-main",
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.(js|ts)?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "main.js",
  },
};
