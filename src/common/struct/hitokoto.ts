import { rendererLogger } from "common/loggers";
import got from "got";

export interface Hitokoto {
  content: string;
  from: string;
}

export async function fetchHitokoto(): Promise<Hitokoto | null> {
  rendererLogger.info("Fetching hitokoto...");
  try {
    const { body } = await got("https://v1.hitokoto.cn");
    rendererLogger.info("Fetched hitokoto");
    const params = JSON.parse(body);
    return { content: params.hitokoto, from: params.from };
  } catch {
    rendererLogger.warn("Unable to fetch hitokoto");
    return null;
  }
}
