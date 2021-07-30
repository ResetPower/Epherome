import { Accessible, StringMap } from "./types";

export function appendZero(src: number): string {
  if (0 <= src && src < 10) {
    return `0${src}`;
  }
  return src.toString();
}

// return an empty function if function is undefined
const emptyFunction = () => {
  /**/
};

export function unwrapFunction<P extends unknown[] = []>(
  fn?: (...args: P) => void
): (...args: P) => void {
  return fn ?? emptyFunction;
}

export function invokeFunction<P extends unknown[], R>(
  fn: (...args: P) => R,
  ...args: P
): R {
  return fn(...args);
}

export function initRequiredFunction(): () => void {
  return () => throwNotInitError();
}

export function throwNotInitError(): never {
  throw new Error("This function is not initialized");
}

// simple toolkit to transfer object to form
// for example:
// { a: 'a', b: 'b' }
// will transferred into
// a=a&b=b
export function obj2form(data: StringMap): string {
  const urlEncodedDataPairs = [];
  for (const name in data) {
    urlEncodedDataPairs.push(
      encodeURIComponent(name) + "=" + encodeURIComponent(data[name])
    );
  }
  return urlEncodedDataPairs.join("&").replace(/%20/g, "+");
}

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

export function format(source: string, ...args: string[]): string {
  return args.length === 0
    ? source
    : args.length === 1
    ? source.replace("{}", args[0])
    : format(source, ...args.slice(1, args.length));
}
