import { EphExtension } from "common/stores/extension";
import { nanoid } from "nanoid";

const extSquare: EphExtension = {
  id: nanoid(),
  meta: {
    name: "ext-square",
    translations: {
      default: "Extension Square",
      "zh-cn": "扩展广场",
    },
    version: "epherome",
    apiVersion: "latest",
    application: {
      entrance: "index.html",
    },
  },
  runnable: `(()=>{bridge.getLogger().info("Hello, World! from ext-square")})();`,
};

export default extSquare;
