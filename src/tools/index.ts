import { StringMap } from "./types";

// get element in array by id
export function getById<T extends WithId>(arr: T[], id: number): T | null {
  for (const i of arr) {
    if (i.id === id) {
      return i;
    }
  }
  return null;
}

// get the id of next array item
export function getNextId<T extends WithId>(arr: T[]): number {
  return arr.length === 0 ? 0 : arr[arr.length - 1].id + 1;
}

// object type that contains an unique id
export interface WithId {
  id: number;
}

export function removePrefix(src: string, pre: string): string {
  return src.startsWith(pre) ? src.substr(pre.length, src.length) : src;
}

export function removeSuffix(src: string, suf: string): string {
  return src.endsWith(suf) ? src.substr(0, src.length - suf.length) : src;
}

export function replaceAll(src: string, a: string, b: string): string {
  return src.split(a).join(b);
}

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

export function unwrapFunction<P>(fn?: (...args: P[]) => void): (...args: P[]) => void {
  return fn ?? emptyFunction;
}

export function initRequiredFunction(): () => void {
  return () => {
    throw new Error("This function is not initialized");
  };
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
    urlEncodedDataPairs.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
  }
  const urlEncodedData = urlEncodedDataPairs.join("&").replace(/%20/g, "+");
  return urlEncodedData;
}
