import path from "path";
import { downloadFile } from "common/utils/files";
import { userDataPath } from "common/utils/info";

export async function downloadSkin(uuid: string): Promise<string> {
  const skinsDir = path.join(userDataPath, "skins");
  const target = path.join(skinsDir, `${uuid}.png`);
  await downloadFile(`https://mc-heads.net/download/${uuid}`, target);
  return target;
}
