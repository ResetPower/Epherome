import { commonLogger } from "common/loggers";

export interface Hitokoto {
  content: string;
  from: string;
}

export function fetchHitokoto(): Promise<Hitokoto | null> {
  return new Promise((resolve) => {
    commonLogger.info("Fetching hitokoto ...");
    window.native.fetchHitokoto((err, data) => {
      if (err) {
        commonLogger.warn("Unable to fetch hitokoto");
      } else {
        commonLogger.info("Fetched hitokoto");
      }
      resolve(data);
    });
  });
}
