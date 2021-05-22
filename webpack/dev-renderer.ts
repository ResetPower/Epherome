// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { rendererProcess } from "./base";
import { Configuration } from "webpack-dev-server";

export default Object.assign(rendererProcess, {
  devServer: <Configuration>{
    port: 3000,
  },
});
