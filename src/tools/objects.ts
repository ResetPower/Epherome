import { StringMap } from "./i18n";

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

export function obj2form(data: StringMap): string {
  const urlEncodedDataPairs = [];
  for (const name in data) {
    urlEncodedDataPairs.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
  }
  const urlEncodedData = urlEncodedDataPairs.join("&").replace(/%20/g, "+");
  return urlEncodedData;
}
