const path = require("path");

module.exports = {
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
