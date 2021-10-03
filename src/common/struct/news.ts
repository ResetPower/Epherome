import { commonLogger } from "common/loggers";
import { promisify } from "util";

export interface NewItem {
  title: string;
  author: string;
  time: string;
  url: string;
}

export async function fetchNews(): Promise<NewItem[] | null> {
  commonLogger.info("Fetching news...");
  try {
    const result = await promisify(window.native.fetchNews)();
    commonLogger.info("Fetched news");
    return result ?? [];
  } catch {
    commonLogger.warn("Unable to fetch news");
    return null;
  }
}
