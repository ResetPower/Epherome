import path from "path";
import { Configuration } from "webpack";

const config: Configuration = {
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

export default config;
