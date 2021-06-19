import { StringMap } from "./types";

// return an empty function if function is undefined
export default function unwrapFunction<P>(
  func: ((...args: P[]) => void) | undefined
): (...args: P[]) => void {
  return (
    func ??
    (() => {
      /* */
    })
  );
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
