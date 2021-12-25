import { rendererLogger } from "common/loggers";
import got from "got";

export interface Hitokoto {
  content: string;
  from: string;
}

export async function fetchHitokoto(): Promise<Hitokoto | null> {
  rendererLogger.info("Fetching hitokoto...");
  try {
    const { body } = await got("https://epherome.com/api/hitokoto");
    rendererLogger.info("Fetched hitokoto");
    return JSON.parse(body);
  } catch {
    rendererLogger.warn("Unable to fetch hitokoto");
    return null;
  }
}
