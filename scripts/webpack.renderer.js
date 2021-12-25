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
        <body>
          <div id="root"></div>
        </body>
      </html>
      `,
        inject: "body",
        title: "Epherome",
        meta: {
          charset: "utf8",
        },
        minify: !dev,
      }),
      dev && new ReactRefreshPlugin(),
      // minimize css in production
      !dev && new CssMinimizerPlugin(),
    ].filter(Boolean)
  ),
});
