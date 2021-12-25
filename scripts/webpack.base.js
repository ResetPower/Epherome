const path = require("path");
const ForkTsCheckerPlugin = require("fork-ts-checker-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

function resolveTsconfigPathsToAlias() {
  const { paths, baseUrl } = require("../tsconfig.json").compilerOptions;
  const aliases = {};
  Object.keys(paths).forEach((item) => {
    const key = item.replace("/*", "");
    aliases[key] = path.resolve(
      baseUrl,
      paths[item][0].replace("/*", "").replace("*", "")
    );
  });
  return aliases;
}

module.exports = ({ dev }, morePlugins = [], moreModuleRules = []) => ({
  mode: dev ? "development" : "production",
  devtool: dev ? "inline-source-map" : undefined,
  module: {
    exprContextCritical: false,
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        exclude: /node_modules/,
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: "file-loader",
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
      ...moreModuleRules,
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".node"],
    alias: resolveTsconfigPathsToAlias(),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  plugins: [new ForkTsCheckerPlugin(), ...morePlugins],
});
