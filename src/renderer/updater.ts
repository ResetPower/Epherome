import { ipcRenderer } from "electron";
import got from "got";
import { logger } from "./global";

export const ephVersion = ipcRenderer.sendSync("get-version");

export interface EphUpdatableVersion {
  name: string;
  log: string;
  need: boolean;
}

export async function checkEphUpdate(): Promise<EphUpdatableVersion | null> {
  try {
    logger.info("Fetching latest version info...");
    const resp = await got.get("https://epherome.com/api/version");
    const params: Omit<EphUpdatableVersion, "need"> = JSON.parse(resp.body);
    const need = params.name !== ephVersion;
    logger.info(
      `Fetched latest version: ${params.name}. Epherome ${
        need ? "isn't" : "is"
      } in the latest version.`
    );
    return { ...params, need };
  } catch {
    return null;
  }
}
