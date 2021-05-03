import { readConfig } from "./config";

export interface SessionSubscription {
  key: string;
  onUpdate: (value: unknown) => void;
}

const subscriptions: SessionSubscription[] = [];

export const sessions: { [key: string]: unknown } = {
  theme: readConfig("theme", "light"),
};

export function getSession<T>(key: string, def: T | undefined = undefined): T {
  const ret = sessions[key];
  if (ret === undefined && def !== undefined) {
    return def;
  } else return ret as T;
}

export function setSession<T>(key: string, value: T): void {
  sessions[key] = value;
  for (const i of subscriptions) {
    if (i !== undefined) {
      if (i.key === key) {
        i.onUpdate(value);
      }
    }
  }
}

export function subscribe(subscription: SessionSubscription): number {
  const index = subscriptions.length;
  subscriptions[index] = subscription;
  return index;
}

export function unsubscribe(index: number): void {
  delete subscriptions[index];
}
