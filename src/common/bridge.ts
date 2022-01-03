import log4js, { Logger } from "log4js";
import { EphExtensionMeta } from "./extension";

export type EphSubscriptionAct = (event: unknown) => unknown;

export interface EphSubscription {
  id: string;
  act: EphSubscriptionAct;
}

export class Bridge {
  meta: EphExtensionMeta;
  subscriptions: EphSubscription[] = [];
  constructor(meta: EphExtensionMeta) {
    this.meta = meta;
  }
  getLogger(): Logger {
    return log4js.getLogger(`${this.meta.name}`);
  }
  subscribe(id: string, act: EphSubscriptionAct) {
    this.subscriptions.push({ id, act });
  }
}
