import { commonLogger } from "common/loggers";
import { nativeRequestAsync } from "core/net";

export interface Hitokoto {
  content: string;
  from: string;
}

export async function fetchHitokoto(): Promise<Hitokoto | null> {
  commonLogger.info("Fetching hitokoto...");
  try {
    const [, body] = await nativeRequestAsync(
      "get",
      "https://epherome.com/api/hitokoto"
    );
    commonLogger.info("Fetched hitokoto");
    return JSON.parse(body);
  } catch {
    commonLogger.warn("Unable to fetch hitokoto");
    return null;
  }
}
