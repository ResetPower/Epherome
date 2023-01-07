import path from "path";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import tsconfig from "../tsconfig.json";
import { WebpackPluginInstance } from "webpack";
import { WebpackConfiguration } from "webpack-dev-server";

function resolveTsconfigPathsToAlias() {
  const { paths, baseUrl } = tsconfig.compilerOptions;
  const aliases: { [key: string]: string } = {};
  Object.entries(paths).forEach(([item, value]) => {
    const key = item.replace("/*", "");
    aliases[key] = path.resolve(
      baseUrl,
      value[0].replace("/*", "").replace("*", "")
    );
  });
  return aliases;
}

const config: (
  env: { dev: boolean },
  morePlugins?: WebpackPluginInstance[]
) => WebpackConfiguration = ({ dev }, morePlugins = []) => ({
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
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"],
    alias: resolveTsconfigPathsToAlias(),
  },
  output: {
    path: path.join(__dirname, "../dist"),
    filename: "[name].js",
  },
  plugins: [new ForkTsCheckerPlugin(), ...morePlugins],
});

export default config;
