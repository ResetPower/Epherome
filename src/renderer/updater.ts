import got from "got";
import { constraints } from "../struct/config";

export interface EphUpdatableVersion {
  need: boolean;
  id: number;
  name: string;
  log: string;
}

export async function checkEphUpdate(): Promise<EphUpdatableVersion | null> {
  try {
    const resp = await got("https://epherome.com/api/version");
    const params: Omit<EphUpdatableVersion, "need"> = JSON.parse(resp.body);
    let need = false;
    if (constraints.versionId < params.id) {
      need = true;
    }
    return { ...params, need };
  } catch {
    return null;
  }
}
