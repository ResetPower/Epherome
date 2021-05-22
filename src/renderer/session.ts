interface Subscription {
  tunnel: string;
  callback: (arg: string) => void;
}

const subscriptions: Subscription[] = [];

export function subscribe(tunnel: string, callback: (arg: string) => void): number {
  const index = subscriptions.length;
  subscriptions[index] = { tunnel, callback };
  return index;
}

export function unsubscribe(index: number): void {
  delete subscriptions[index];
}

export function subscribeAsync(key: string): Promise<string> {
  return new Promise((resolve) => {
    const index = subscribe(key, (v) => {
      unsubscribe(index);
      resolve(v);
    });
  });
}

export function broadcast(tunnel: string, arg = "") {
  for (const i of subscriptions) {
    if (i !== undefined) {
      // run subscription callback
      i.tunnel === tunnel && i.callback(arg);
    }
  }
}
