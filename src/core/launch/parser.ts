import { path } from "@tauri-apps/api";
import { MinecraftProfile } from "../../stores/struct";
import { ClientJson } from "./struct";
import { exists, readTextFile } from "@tauri-apps/api/fs";

export function mergeClientJson(
  parsed: ClientJson,
  inherit: ClientJson,
  reserveId = false
): ClientJson {
  const ret = { ...inherit, ...parsed };
  if (inherit.arguments && parsed.arguments && ret.arguments) {
    if (!ret.arguments.jvm) {
      ret.arguments.jvm = [];
    }
    if (inherit.arguments.jvm) {
      ret.arguments.jvm?.push(...inherit.arguments.jvm);
    }
    ret.arguments.game.push(...inherit.arguments.game);
  } else if (inherit.minecraftArguments) {
    ret.minecraftArguments = [
      ret.minecraftArguments,
      inherit.minecraftArguments,
    ].join(" ");
  }
  if (reserveId) {
    ret.id = inherit.id;
  }
  ret.libraries.push(...inherit.libraries);
  return ret;
}

export async function parseJson(
  profile: MinecraftProfile,
  reserveId = false
): Promise<ClientJson> {
  const dir = await path.resolve(profile.gameDir);
  const jsonFile = await path.join(
    dir,
    "versions",
    profile.version,
    `${profile.version}.json`
  );
  const vanillaJsonFile = await path.join(
    dir,
    "versions",
    profile.version,
    "vanilla.json"
  );
  let parsed: ClientJson = JSON.parse(await readTextFile(jsonFile));
  if (await exists(vanillaJsonFile)) {
    const vanilla: ClientJson = JSON.parse(await readTextFile(vanillaJsonFile));
    parsed = mergeClientJson(parsed, vanilla, reserveId);
  } else if (parsed.inheritsFrom) {
    const inheritsFrom = parsed.inheritsFrom;
    const inherit: ClientJson = JSON.parse(
      await readTextFile(
        await path.join(dir, "versions", inheritsFrom, `${inheritsFrom}.json`)
      )
    );
    parsed = mergeClientJson(parsed, inherit, reserveId);
  }
  return parsed;
}
