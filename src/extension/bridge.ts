import { EphExtension } from "common/stores/extension";
import log4js, { Logger } from "log4js";

export class Bridge {
  ext: EphExtension;
  constructor(ext: EphExtension) {
    this.ext = ext;
  }
  getLogger(): Logger {
    return log4js.getLogger(`Ext@${this.ext.id}`);
  }
}
