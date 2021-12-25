import { rendererLogger } from "common/loggers";
import { promisify } from "util";

export interface NewItem {
  title: string;
  author: string;
  time: string;
  url: string;
}

export async function fetchNews(): Promise<NewItem[] | null> {
  rendererLogger.info("Fetching news...");
  try {
    const result = await promisify(window.native.fetchNews)();
    rendererLogger.info("Fetched news");
    return result ?? [];
  } catch {
    rendererLogger.warn("Unable to fetch news");
    return null;
  }
}
