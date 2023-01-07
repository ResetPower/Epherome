import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlPlugin from "html-webpack-plugin";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import base from "./webpack.base";
import { WebpackConfiguration } from "webpack-dev-server";

const config: (env: { dev: boolean }) => WebpackConfiguration = ({ dev }) => ({
  entry: {
    app: "./src/eph",
  },
  target: "electron-renderer",
  devServer: {
    port: 3000,
    hot: true,
  },
  ...base({ dev }, [
    new MiniCssExtractPlugin(),
    new HtmlPlugin({
      inject: "body",
      title: "Epherome",
      meta: { charset: "utf8" },
      minify: !dev,
    }),
    dev ? new ReactRefreshPlugin() : new CssMinimizerPlugin(),
  ]),
});

export default config;
