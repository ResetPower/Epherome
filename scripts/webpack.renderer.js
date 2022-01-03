const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlPlugin = require("html-webpack-plugin");
const ReactRefreshPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const base = require("./webpack.base");

module.exports = ({ dev }) => ({
  entry: {
    app: "./src/eph",
  },
  module: {
    exprContextCritical: false,
  },
  target: "electron-renderer",
  devServer: {
    port: 3000,
    hot: true,
  },
  ...base(
    { dev },
    [
      new MiniCssExtractPlugin(),
      new HtmlPlugin({
        templateContent: `<!DOCTYPE html>
<html>
  <head>
    <title>Epherome</title>
    <meta charset="utf8"/>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
      `,
        inject: "body",
        title: "Epherome",
        minify: !dev,
      }),
      dev && new ReactRefreshPlugin(),
      // minimize css in production
      !dev && new CssMinimizerPlugin(),
    ].filter(Boolean)
  ),
});
