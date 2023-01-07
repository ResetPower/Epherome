import { WebpackConfiguration } from "webpack-dev-server";
import base from "./webpack.base";

const config: (env: { dev: boolean }) => WebpackConfiguration = ({ dev }) => ({
  entry: {
    main: "./src/main",
  },
  target: "electron-main",
  ...base({ dev }),
});

export default config;
