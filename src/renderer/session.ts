import { Logger } from "../tools/logging";
import { unwrapFunction } from "../tools/objects";

const sessionLogger = new Logger("Session");

const subscriptions: { [key: string]: (arg: string) => void } = {};

export function subscribe(tunnel: string, callback: (arg: string) => void): void {
  subscriptions[tunnel] = callback;
  sessionLogger.debug(`Subscribed tunnel '${tunnel}'`);
}

export function unsubscribe(tunnel: string): void {
  delete subscriptions[tunnel];
  sessionLogger.debug(`Unsubscribed tunnel '${tunnel}'`);
}

// wait until the event invoked
export function subscribeAsync(key: string): Promise<string> {
  return new Promise((resolve) => {
    subscribe(key, (v) => {
      unsubscribe(key);
      resolve(v);
    });
  });
}

export function broadcast(tunnel: string, arg = ""): void {
  unwrapFunction(subscriptions[tunnel])(arg);
}
