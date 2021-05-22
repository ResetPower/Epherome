import { Configuration } from "webpack";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { mainProcess, rendererProcess } from "./base";

export default [
  Object.assign<Configuration, Configuration>(mainProcess, {
    mode: "production",
    devtool: "source-map",
  }),
  Object.assign<Configuration, Configuration>(rendererProcess, {
    mode: "production",
    devtool: "source-map",
  }),
];
