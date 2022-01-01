import log4js, { Logger } from "log4js";
import { EphExtension } from "./extension";

export type EphSubscriptionAct = (event: unknown) => unknown;

export interface EphSubscription {
  id: string;
  act: EphSubscriptionAct;
}

export class Bridge {
  ext: EphExtension;
  subscriptions: EphSubscription[] = [];
  constructor(ext: EphExtension) {
    this.ext = ext;
  }
  getLogger(): Logger {
    return log4js.getLogger(`${this.ext.meta.name}`);
  }
  subscribe(id: string, act: EphSubscriptionAct) {
    this.subscriptions.push({ id, act });
  }
}
