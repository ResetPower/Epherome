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

export default (env: { [key: string]: string }): Config[] => {
  // build environment
  const dev = env.dev;
  process.env.NODE_ENV = dev ? "development" : "production";

  // base config
  const base: Config = {
    mode: dev ? "development" : "production",
    devtool: "source-map",
    module: {
      exprContextCritical: false,
      rules: [
        {
          test: /\.(js|ts|tsx)?$/,
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
    },
    output: {
      path: path.join(__dirname, "./dist"),
      filename: "[name].js",
    },
  };

  // main process
  const main: Config = {
    entry: {
      main: "./src/main/main",
    },
    target: "electron-main",
  };

  // renderer process
  const renderer: Config = {
    entry: {
      app: "./src/renderer/index",
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
        title: "Epherome",
        template: "./assets/template.txt",
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
