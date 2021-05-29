import { Configuration as Config } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import path from "path";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CssMinimizerWebpackPlugin from "css-minimizer-webpack-plugin";

interface DevConfig extends Config {
  devServer?: WebpackDevServerConfiguration;
}

export default (env: { [key: string]: string }) => {
  const dev = env.dev;

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
          test: /\.(js|ts)?$/,
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

  const renderer: DevConfig = {
    entry: {
      app: "./src/renderer/index",
    },
    target: "electron-renderer",
    mode: dev ? "development" : "production",
    devtool: dev ? "inline-source-map" : "source-map",
    module: {
      rules: [
        {
          test: /\.(js|ts|tsx)?$/,
          exclude: /node_modules/,
          loader: "ts-loader",
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
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
    devServer: dev
      ? {
          port: 3000,
        }
      : {},
    plugins: [
      new HtmlWebpackPlugin({
        title: "Epherome",
        template: "./assets/template.html",
      }),
      new MiniCssExtractPlugin(),
      new CssMinimizerWebpackPlugin(),
    ],
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
