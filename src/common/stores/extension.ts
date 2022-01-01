import { EphSubscription } from "common/bridge";
import { EphExtension } from "common/extension";

export type EphSubscriptionMap = Record<string, EphSubscription[]>;

export class ExtensionStore {
  extensions: EphExtension[] = [];
  subscriptionMap: EphSubscriptionMap = {};
  load(extensions: EphExtension[], subscriptionMap: EphSubscriptionMap) {
    this.extensions = extensions;
    this.subscriptionMap = subscriptionMap;
  }
}

export const extensionStore = new ExtensionStore();
