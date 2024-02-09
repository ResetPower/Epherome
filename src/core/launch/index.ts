import { invoke, path } from "@tauri-apps/api";
import { MinecraftAccount, MinecraftProfile } from "../../stores/struct";
import { MinecraftDownloadProvider, MinecraftUrlUtil } from "../url";
import { dataDir } from "../../stores/config";
import { YggdrasilAuthenticator, prefetch } from "../auth/yggdrasil";
import { parseJson } from "./parser";
import { downloadFile, ensureDir } from "../../utils/file";
import { runMinecraft } from "./runner";
import { isCompliant, osName } from "./rules";
import { ClientJsonArguments } from "./struct";
import { exists } from "@tauri-apps/api/fs";
import { analyzeAssets, analyzeLibrary } from "./libraries";
import { installAuthlibInjector } from "../install/authlib";

export interface MinecraftLaunchOptions {
  account: MinecraftAccount;
  profile: MinecraftProfile;
  provider: MinecraftDownloadProvider;
}

export async function launchMinecraft(
  options: MinecraftLaunchOptions
): Promise<"tokenUnavailable" | void> {
  const urlUtil = new MinecraftUrlUtil(options.provider);

  console.info("Launching Minecraft ...");
  const account = options.account;
  const profile = options.profile;
  const authlibInjectorPath = await path.join(dataDir, "authlib-injector.jar");

  const buff: string[] = [];

  // authenticating

  if (navigator.onLine) {
    if (account.type === "authlib" && account.authserver && account.token) {
      const authenticator = new YggdrasilAuthenticator(account.authserver);
      console.info("Validating authlib account token");
      const valid = await authenticator.validate(account.token);
      if (!valid) {
        console.info("Account token is not valid, refreshing");
        const refreshed = await authenticator.refresh(account.token);
        if (!refreshed) {
          console.warn("Failed to refresh token, requesting for password");
          return "tokenUnavailable";
        } else {
          authenticator.update(account, refreshed);
        }
      }
    }
  } else {
    console.info("Network not available, account validating skipped");
  }

  // parsing json file

  const dir = await path.resolve(profile.gameDir);
  const parsed = await parseJson(profile);

  let clientJar = parsed.jar // use jar file in json if it has
    ? await path.join(dir, "versions", parsed.jar, `${parsed.jar}.jar`)
    : await path.join(
        dir,
        "versions",
        profile.version,
        `${profile.version}.jar`
      );
  const nativeDir = await path.join(
    dir,
    "versions",
    profile.version,
    `${profile.version}-natives`
  );
  await ensureDir(nativeDir);

  if (!(await exists(clientJar)) && parsed.inheritsFrom) {
    const inheritsFrom = parsed.inheritsFrom;
    clientJar = await path.join(
      dir,
      "versions",
      inheritsFrom,
      `${inheritsFrom}.jar`
    );
  }

  // analyzing library & assets
  const analyzedLibrary = await analyzeLibrary(dir, parsed.libraries);
  const assetIndex = parsed.assetIndex;
  const assetsRoot = await path.join(dir, "assets");
  const cp = analyzedLibrary.classpath;
  cp.push(clientJar);

  // download missing libraries
  const missingLibList = analyzedLibrary.missing.map((val) => ({
    url: val.url,
    target: val.path,
    size: val.size,
  }));
  if (missingLibList.length > 0) {
    for (const lib of missingLibList) {
      await downloadFile(lib.url, lib.target);
    }
  }

  // download missing libraries
  const analyzedAssets = await analyzeAssets(dir, assetIndex);
  const missingAssetList = analyzedAssets.missing.map((val) => ({
    url: val.url,
    target: val.path,
    size: val.size,
  }));
  if (missingAssetList.length > 0) {
    for (const asset of missingAssetList) {
      await downloadFile(asset.url, asset.target);
    }
  }

  // inject authlib injector
  if (account.type === "authlib" && account.authserver) {
    if (!(await exists(authlibInjectorPath))) {
      await installAuthlibInjector(authlibInjectorPath, urlUtil);
    }
    buff.push(`-javaagent:${authlibInjectorPath}=${account.authserver}`);
    buff.push("-Dauthlibinjector.side=client");
    buff.push(
      `-Dauthlibinjector.yggdrasil.prefetched=${await prefetch(account.authserver)}`
    );
  }

  // unzip native libraries
  for (const i of analyzedLibrary.natives) {
    await invoke("extract_zip", { zipfile: i, target: nativeDir });
  }

  // resolve arguments
  const argumentsMap = {
    // game args
    auth_player_name: account.name,
    version_name: parsed.inheritsFrom ?? profile.version,
    auth_session: `token:${account.token}`,
    game_directory: dir,
    game_assets: assetsRoot,
    assets_root: assetsRoot,
    assets_index_name: assetIndex.id,
    auth_uuid: account.uuid,
    auth_access_token: account.token ?? "",
    user_type: "mojang",
    user_properties: `{}`,
    version_type: parsed.type,
    // jvm args
    natives_directory: nativeDir,
    // launcher_name: "Epherome",
    // launcher_version: eph_version,
    classpath: cp.join(path.delimiter),
    classpath_separator: path.delimiter,
    library_directory: await path.join(dir, "libraries"),
  };

  const reg = /\${([\w]*)}/g;
  const resolveMinecraftArgs = (arr: ClientJsonArguments) => {
    const act = (i: string) => {
      i = i.replace(reg, (_, key) => {
        const item = argumentsMap[key as keyof typeof argumentsMap];
        if (item) {
          return item;
        } else {
          console.warn(`key "${key}" not exist on arguments' map`);
          return "${" + key + "}";
        }
      });
      buff.push(i);
    };
    for (const i of arr) {
      if (typeof i === "string") act(i);
      else if (
        isCompliant(i.rules, {
          has_custom_resolution: false,
        })
      ) {
        if (typeof i.value === "string") act(i.value);
        else i.value.forEach((i) => act(i));
      }
    }
  };

  // jvm arguments
  buff.push("-Dlog4j2.formatMsgNoLookups=true");
  buff.push(`-Dminecraft.client.jar=${clientJar}`);
  if (parsed.arguments && parsed.arguments.jvm) {
    resolveMinecraftArgs(parsed.arguments.jvm);
  } else {
    if (osName === "darwin") {
      buff.push("-Xdock:name=Minecraft");
    }
    buff.push(
      `-Djava.library.path=${argumentsMap.natives_directory}`,
      // `-Dminecraft.launcher.brand=${argumentsMap.launcher_name}`,
      // `-Dminecraft.launcher.version=${argumentsMap.launcher_version}`,
      `-cp`,
      argumentsMap.classpath
    );
  }
  buff.push(parsed["mainClass"]);

  // game arguments
  if (parsed.arguments) {
    resolveMinecraftArgs(parsed.arguments.game);
  } else if (parsed.minecraftArguments) {
    resolveMinecraftArgs(parsed.minecraftArguments.split(" "));
  }

  await runMinecraft(
    "/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home/bin/java",
    buff,
    dir
  );
}
