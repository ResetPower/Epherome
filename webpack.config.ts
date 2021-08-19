import { Configuration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlPlugin from "html-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";

const templateContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Epherome</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; img-src *;">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

interface Config extends Configuration {
  devServer?: WebpackDevServerConfiguration;
}

function resolveTsconfigPathsToAlias() {
  const { paths, baseUrl } = require("./tsconfig.json").compilerOptions;
  const aliases: { [key: string]: string } = {};
  Object.keys(paths).forEach((item) => {
    const key = item.replace("/*", "");
    const value = path.resolve(
      baseUrl,
      paths[item][0].replace("/*", "").replace("*", "")
    );
    aliases[key] = value;
  });
  return aliases;
}

export default (env: { [key: string]: string }): Config[] => {
  // build environment
  const dev = env.dev;
  process.env.NODE_ENV = dev ? "development" : "production";

  // base config
  const base: Config = {
    mode: dev ? "development" : "production",
    devtool: dev ? "inline-source-map" : undefined,
    module: {
      exprContextCritical: false,
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
          use: "file-loader",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
      alias: resolveTsconfigPathsToAlias(),
    },
    output: {
      path: path.join(__dirname, "./dist"),
      filename: "[name].js",
    },
  };

  // main process
  const main: Config = {
    entry: {
      main: "./src/main",
    },
    target: "electron-main",
  };

  // renderer process
  const renderer: Config = {
    entry: {
      app: "./src/eph",
    },
    target: "electron-renderer",
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
    devServer: {
      hot: true,
      port: 3000,
    },
    plugins: [
      new HtmlPlugin({
        templateContent,
        inject: "body",
      }),
      new MiniCssExtractPlugin(),
      // minimize css in production
      ...(dev ? [] : [new CssMinimizerPlugin()]),
      ...(dev ? [new ReactRefreshPlugin()] : []),
    ],
  };

  let ret: Config[] = [];
  if (env.process === "main") {
    ret = [main];
  } else if (env.process === "renderer") {
    ret = [renderer];
  } else if (env.process === "all") {
    ret = [main, renderer];
  } else {
    throw new Error("env.process should be 'main', 'renderer' or 'all'");
  }

  return ret.map((value) => ({ ...base, ...value }));
};
