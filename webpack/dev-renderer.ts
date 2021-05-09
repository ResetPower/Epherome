import path from "path";
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

interface Configuration extends WebpackConfiguration {
  devServer: WebpackDevServerConfiguration;
}

const config: Configuration = {
  entry: {
    app: "./src/renderer/index.ts",
  },
  target: "electron-renderer",
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)?$/,
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
  devServer: {
    contentBase: path.join(__dirname, "../public"),
    contentBasePublicPath: "/",
    port: 3000,
  },
};

export default config;
