import { coreLogger } from "common/loggers";
import { ephVersion } from "common/utils/info";
import got from "got";

export interface EphUpdatableVersion {
  name: string;
  need: boolean;
}

export async function checkEphUpdate(): Promise<EphUpdatableVersion | null> {
  try {
    const resp = await got("https://api.epherome.com/version");
    const params: Omit<EphUpdatableVersion, "need"> = JSON.parse(resp.body);
    const need = params.name !== ephVersion;
    coreLogger.info(
      `Fetched latest version: ${params.name}. Epherome ${
        need ? "isn't" : "is"
      } in the latest version.`
    );
    return { ...params, need };
  } catch {
    return null;
  }
}
