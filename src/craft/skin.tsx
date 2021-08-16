import path from "path";
import Image from "../components/Image";
import { downloadFile } from "../models/files";
import { userDataPath } from "../struct/config";

export const steveId = "MHF_Steve";
export const alexId = "MHF_Alex";

export function Avatar(props: { uuid: string }): JSX.Element {
  return (
    <Image
      src={`https://mc-heads.net/avatar/${props.uuid}`}
      className="w-7 h-7"
      rounded
    />
  );
}

export function Body(props: { uuid: string }): JSX.Element {
  return (
    <Image
      className="w-40"
      src={`https://mc-heads.net/body/${props.uuid}`}
      rounded
    />
  );
}

export async function downloadSkin(uuid: string): Promise<string> {
  const skinsDir = path.join(userDataPath, "skins");
  const target = path.join(skinsDir, `${uuid}.png`);
  await downloadFile(`https://mc-heads.net/download/${uuid}`, target);
  return target;
}
