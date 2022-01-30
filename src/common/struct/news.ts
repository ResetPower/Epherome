import { rendererLogger } from "common/loggers";

export interface NewItem {
  title: string;
  author: string;
  time: string;
  url: string;
}

export async function fetchNews(): Promise<NewItem[] | null> {
  rendererLogger.info("Fetching news...");
  try {
    const result = await new Promise<NewItem[]>((resolve, reject) =>
      window.native.fetchNews((err, data) => {
        data ? resolve(data) : reject(err);
      })
    );
    rendererLogger.info("Fetched news");
    return result ?? [];
  } catch {
    rendererLogger.warn("Unable to fetch news");
    return null;
  }
}
