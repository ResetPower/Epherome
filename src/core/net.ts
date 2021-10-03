export function nativeRequestAsync(
  method: "get" | "post",
  url: string
): Promise<[number, string]> {
  return new Promise((resolve, reject) =>
    window.native.request(method, url, (err, data) => {
      if (err || !data) {
        reject(err?.toString());
      } else {
        resolve(data);
      }
    })
  );
}
