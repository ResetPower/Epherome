export interface StringMap {
  [key: string]: string;
}

export class HashMap {
  private pairs: StringMap = {};
  constructor(initMap?: StringMap) {
    initMap && (this.pairs = initMap);
  }
  put(key: string, value: string): void {
    this.pairs[key] = value;
  }
  get(key: string): string | undefined {
    return this.pairs[key];
  }
}

export interface AnyMap {
  [key: string]: unknown;
}

export type DefaultFn = () => unknown;

export enum Trilean {
  negative = -1,
  neutral = 0,
  positive = 1,
}

export type Nullable<T> = T | null;

export type DefaultCb<E, T> = (err: Nullable<E>, data: Nullable<T>) => unknown;
export type IsOkCb = (isOk: boolean) => unknown;

export type ErrorHandler = (error: Error) => unknown;

export type LoadingStatus = "pending" | "error" | "done";

// simple toolkit to transfer object to form
// for example:
// { a: 'a', b: 'b' }
// will transferred into
// a=a&b=b
export function form(data: StringMap): string {
  const urlEncodedDataPairs = [];
  for (const name in data) {
    urlEncodedDataPairs.push(
      encodeURIComponent(name) + "=" + encodeURIComponent(data[name])
    );
  }
  return urlEncodedDataPairs.join("&").replace(/%20/g, "+");
}

export function json(object: { [key: string]: unknown }): string {
  return JSON.stringify(object);
}

// value or a function returns value (with or without parameters)
export type Accessible<T, P extends unknown[] = []> = T | ((...args: P) => T);

export function unwrapAccessible<T, P extends unknown[] = []>(
  accessible: Accessible<T, P>,
  ...args: P
): T {
  if (accessible instanceof Function) {
    return accessible(...args);
  } else {
    return accessible;
  }
}

export function call<P extends unknown[], R>(
  fn: ((...args: P) => R) | undefined,
  ...args: P
): R | undefined {
  if (fn) {
    return fn(...args);
  } else {
    return undefined;
  }
}

export function adapt<T>(value: T, ...keys: T[]): boolean {
  for (const i of keys) {
    if (i === value) return true;
  }
  return false;
}

export function normalizeArray<T>(arr: T | T[]): T[] {
  return Array.isArray(arr) ? arr : [arr];
}

export function format(source: string, ...params: string[]): string {
  params.forEach((param, index) => {
    source = source.replace(`{${index}}`, param);
  });
  return source;
}

export function apply<T, R>(
  obj: T | undefined,
  act: (obj: T) => R
): R | undefined {
  return obj ? act(obj) : undefined;
}

export function combineFun(...fun: (DefaultFn | undefined)[]): DefaultFn {
  return () => fun.forEach((f) => f && f());
}

export function match<T, V>(value: T, ...cases: [T, V][]): V | undefined {
  for (const [t, v] of cases) {
    if (t === value) {
      return v;
    }
  }
}
