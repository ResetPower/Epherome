import { Configuration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlPlugin from "html-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";

interface Config extends Configuration {
  devServer?: WebpackDevServerConfiguration;
}

function makeArray<T>(...items: (T | undefined)[]): T[] {
  const arr = [];
  for (const i of items) {
    // don't add item if undefined
    i && arr.push(i);
  }
  return arr;
}

export default (env: { [key: string]: string }): Config | Config[] => {
  // build environment
  const dev = env.dev;

  // main process
  const main: Config = {
    entry: {
      main: "./src/main/main",
    },
    target: "electron-main",
    mode: dev ? "development" : "production",
    devtool: dev ? "inline-source-map" : "source-map",
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: "ts-loader",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".ts"],
    },
    output: {
      path: path.join(__dirname, "./dist"),
      filename: "main.js",
    },
  };

  // renderer process
  const renderer: Config = {
    entry: {
      app: "./src/renderer/index",
    },
    target: "electron-renderer",
    mode: dev ? "development" : "production",
    devtool: dev ? "inline-source-map" : "source-map",
    module: {
      exprContextCritical: false,
      rules: [
        {
          test: /\.(ts|tsx)?$/,
          exclude: /node_modules/,
          loader: "ts-loader",
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        },
        {
          test: /\.(eot|woff|woff2|ttf)?$/,
          loader: "file-loader",
        },
      ],
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
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
    },
    output: {
      path: path.join(__dirname, "./dist"),
      filename: "[name].js",
    },
    devServer: {
      hot: true,
      port: 3000,
    },
    plugins: makeArray(
      new HtmlPlugin({
        title: "Epherome",
        template: "./assets/template.txt",
        inject: "body",
      }),
      new MiniCssExtractPlugin(),
      // minimize css in production
      dev ? undefined : new CssMinimizerPlugin(),
      dev ? new ReactRefreshPlugin() : undefined
    ),
  };

  if (env.process === "main") {
    return main;
  } else if (env.process === "renderer") {
    return renderer;
  } else if (env.process === "all") {
    return [main, renderer];
  } else {
    throw new Error("env.process should be 'main', 'renderer' or 'all'");
  }
};
