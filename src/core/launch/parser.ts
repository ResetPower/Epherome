import path from "path";
import fs from "fs";
import { MinecraftProfile } from "common/struct/profiles";
import { ClientJson } from "core/launch/struct";

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

export function parseJson(
  profile: MinecraftProfile,
  reserveId = false
): ClientJson {
  const dir = path.resolve(profile.dir);
  const jsonFile = path.join(
    dir,
    "versions",
    profile.ver,
    `${profile.ver}.json`
  );
  let parsed: ClientJson = JSON.parse(fs.readFileSync(jsonFile).toString());
  if (parsed.inheritsFrom) {
    const inheritsFrom = parsed.inheritsFrom;
    const inherit: ClientJson = JSON.parse(
      fs
        .readFileSync(
          path.join(dir, "versions", inheritsFrom, `${inheritsFrom}.json`)
        )
        .toString()
    );
    parsed = mergeClientJson(parsed, inherit, reserveId);
  }
  return parsed;
}
