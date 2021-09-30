export interface NewItem {
  title: string;
  author: string;
  time: string;
  url: string;
}

export function fetchNews(): Promise<NewItem[]> {
  return new Promise((resolve, reject) =>
    window.native.fetchNews((err, news) => {
      if (err) {
        reject("Unable to fetch news");
      } else {
        resolve(news ?? []);
      }
    })
  );
}
