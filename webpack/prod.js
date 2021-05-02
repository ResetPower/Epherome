const path = require("path");
const fs = require("fs");

function copy(src, dst) {
  let paths = fs.readdirSync(src);
  paths.forEach(function (path) {
    var _src = src + '/' + path;
    var _dst = dst + '/' + path;
    fs.stat(_src, function (err, stats) {
      if (err) throw err;
      if (stats.isFile()) {
        let readable = fs.createReadStream(_src);
        let writable = fs.createWriteStream(_dst);
        readable.pipe(writable);
      } else if (stats.isDirectory()) {
        checkDirectory(_src, _dst, copy);
      }
    });
  });
}
function checkDirectory(src, dst, callback) {
  fs.access(dst, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdirSync(dst);
      callback(src, dst);
    } else {
      callback(src, dst);
    }
  });
}

copy("public", "dist");

module.exports = [
  {
    entry: {
      main: "./src/main/main.ts",
    },
    target: "electron-main",
    mode: "production",
    module: {
      rules: [
        {
          test: /\.(js|ts)?$/,
          exclude: /node_modules/,
          loader: "ts-loader",
        },
      ],
    },
    resolve: {
      extensions: [".js", ".ts"],
    },
    output: {
      path: path.join(__dirname, "../dist"),
      filename: "main.js",
    },
  },
  {
    entry: {
      app: "./src/renderer/index.ts",
    },
    target: "electron-renderer",
    mode: "production",
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
  },
];
