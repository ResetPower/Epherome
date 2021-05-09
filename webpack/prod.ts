import path from "path";
import fs from "fs";
import { Configuration } from "webpack";

fs.writeFileSync("dist/index.html", fs.readFileSync("public/index.html"));

const configs: Configuration[] = [
  {
    entry: {
      main: "./src/main/main.ts",
    },
    target: "electron-main",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.(js|ts)?$/,
          exclude: /node_modules/,
          loader: "ts-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(eot|woff|woff2|ttf)?$/,
          loader: "file-loader",
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
  },
  {
    entry: {
      app: "./src/renderer/index.ts",
    },
    target: "electron-renderer",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)?$/,
          exclude: /node_modules/,
          loader: "ts-loader",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
    },
    optimization: {
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
          },
        },
      },
    },
    output: {
      path: path.join(__dirname, "../dist"),
      filename: "[name].js",
    },
  },
];

export default configs;
