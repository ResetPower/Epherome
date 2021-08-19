import got from "got";
import { commonLogger } from "common/loggers";

export interface Hitokoto {
  content: string;
  from: string;
}

export async function fetchHitokoto(): Promise<Hitokoto | null> {
  commonLogger.info("Fetching hitokoto ...");
  try {
    const resp = await got.get("https://epherome.com/api/hitokoto");
    const parsed = JSON.parse(resp.body);
    commonLogger.info("Fetched hitokoto");
    return {
      content: parsed.content,
      from: `——${parsed.from}`,
    };
  } catch (e) {
    commonLogger.warn("Unable to fetch hitokoto");
    return null;
  }
}
