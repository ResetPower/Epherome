const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const postcss = require("esbuild-postcss");
const ts = require("typescript");
const cp = require("child_process");

const args = process.argv.slice(2);
const mode = args[0];
const proc = args[1];
const watch = args[2] === "watch";
const dev = mode === "dev";

function adapt(src, ...items) {
  for (const i of items) {
    if (i === src) {
      return true;
    }
  }
  return false;
}

if (!adapt(mode, "dev", "prod") || !adapt(proc, "main", "renderer", "all")) {
  console.error(
    "Usage: node build.js <mode> <process> <watch>\n  - mode: dev | prod\n  - process: main | renderer | all\n  - watch (optional): watch"
  );
  process.exit(1);
}

const jsxReact17Plugin = {
  name: "jsx-react-17",
  setup: (build) => {
    build.onLoad({ filter: /\.tsx$/ }, (args) => {
      return {
        contents: ts.transpile(
          fs.readFileSync(args.path, "utf8"),
          require("../tsconfig.json").compilerOptions,
          path.basename(args.path)
        ),
      };
    });
  },
};

const templateContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Epherome</title>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; img-src * data:;" />
    <link rel="stylesheet" href="renderer.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="renderer.js"></script>
  </body>
</html>
`;
const main = "./src/main";
const renderer = "./src/eph";
const preload = "./src/preload";

const buildOptions = {
  entryPoints:
    proc === "main"
      ? { main, preload }
      : proc === "renderer"
      ? { renderer }
      : proc === "all"
      ? { main, preload, renderer }
      : {},
  platform: "node",
  external: ["electron", "*.node"],
  loader: {
    ".png": "file",
    ".woff": "file",
    ".woff2": "file",
  },
  minify: !dev,
  sourcemap: dev,
  bundle: true,
  outdir: "dist",
  format: "cjs",
  logLevel: "info",
  define: {
    "process.env.NODE_ENV": dev ? `"development"` : `"production"`,
    this: "undefined",
  },
  plugins: [postcss(), jsxReact17Plugin],
};

if (watch) {
  esbuild
    .serve(
      {
        port: 3000,
        servedir: "dist",
        onRequest: (args) => {
          if (args.path === "/") {
            console.log(`👌 Rebuilt successful in ${args.timeInMS}ms!`);
          }
        },
      },
      buildOptions
    )
    .then(() => {
      if (adapt(proc, "renderer", "all")) {
        // emit html file
        fs.writeFileSync("dist/index.html", templateContent);
      }
    });
} else {
  esbuild.build(buildOptions).then(() => {
    if (adapt(proc, "renderer", "all")) {
      // emit html file
      fs.writeFileSync("dist/index.html", templateContent);
    }
    if (adapt(proc, "main", "all")) {
      // compile rust
      cp.execSync(
        `npx cargo-cp-artifact -nc dist/native.node -- cargo build ${
          mode === "dev" ? "" : "--release"
        } --message-format=json-render-diagnostics`,
        { stdio: "ignore" }
      );
      cp.execSync("npx electron-rebuild dist/native.node", { stdio: "ignore" });
    }
  });
}
