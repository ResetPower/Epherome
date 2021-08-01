import fs from "fs";
import path from "path";
import { MinecraftProfile } from "../struct/profiles";
import { MinecraftAccount, updateAccountToken } from "../struct/accounts";
import { authenticate, refresh, validate } from "./net/auth";
import { analyzeLibrary } from "./libraries";
import { ClientJson, ClientJsonArguments, mergeClientJson } from "./struct";
import { isCompliant, osName } from "./rules";
import { unzipNatives } from "./unzip";
import { runMinecraft } from "./runner";
import { createDirIfNotExist, downloadFile } from "./net/download";
import { Logger } from "../tools/logger";
import { DefaultFn } from "../tools";
import { isJava16Required, parseMinecraftVersionDetail } from "./versions";
import { showJava16RequiredDialog, showNoJavaDialog } from "./alerts";
import { Java } from "../struct/java";
import { t } from "../intl";
import { ephVersion } from "../renderer/updater";
import { userDataPath } from "../struct/config";

// logger for minecraft launch core
export const coreLogger = new Logger("Core");

export interface MinecraftLaunchOptions {
  account: MinecraftAccount;
  profile: MinecraftProfile;
  java?: Java;
  setHelper: (value: string) => void;
  requestPassword: (again: boolean) => Promise<string>;
  onDone: DefaultFn;
}

export async function launchMinecraft(
  options: MinecraftLaunchOptions
): Promise<void> {
  const java = options.java;

  if (!java) {
    showNoJavaDialog();
    options.onDone();
    return;
  }

  const defaultHelper = t("launching");
  coreLogger.info("Launching Minecraft ...");
  const account = options.account;
  const profile = options.profile;
  const setHelper = options.setHelper;
  const authlibInjectorPath = path.join(
    userDataPath,
    "authlib-injector-1.1.35.jar"
  );

  const buff = [];
  const dir = path.resolve(profile.dir);

  setHelper(defaultHelper);

  // === authenticating ===
  if (navigator.onLine) {
    if (account.mode === "mojang" || account.mode === "authlib") {
      const server = account.mode === "mojang" ? undefined : account.authserver;
      coreLogger.info("Validating account token");
      const valid = await validate(account.token, server);
      if (!valid) {
        coreLogger.info("Account token is not valid, refreshing");
        const refreshed = await refresh(account.token, server);
        if (refreshed.err) {
          const act = async (again: boolean) => {
            const password = await options.requestPassword(again);
            const result = await authenticate(account.email, password, server);
            if (result.err) {
              coreLogger.warn("Password wrong, requesting for password again");
              await act(true);
            } else {
              updateAccountToken(account, result.token);
            }
          };
          coreLogger.warn("Failed to refresh token, requesting for password");
          await act(false);
        } else {
          updateAccountToken(account, refreshed.token);
        }
      }
    } else if (account.mode === "microsoft") {
      // TODO Validate Microsoft Account Token
    }
  } else {
    coreLogger.info("Network not available, account validating skipped");
  }

  // === parsing json file ===
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
    parsed = mergeClientJson(parsed, inherit);
  }

  const clientJar = parsed.jar // use jar file in json if it has
    ? path.join(dir, "versions", parsed.jar, `${parsed.jar}.jar`)
    : path.join(dir, "versions", profile.ver, `${profile.ver}.jar`);
  const nativeDir = path.join(
    dir,
    "versions",
    profile.ver,
    `${profile.ver}-natives`
  );
  createDirIfNotExist(nativeDir);

  // === analyzing library ===
  const obj = analyzeLibrary(dir, parsed.libraries);
  const assetIndex = parsed.assetIndex;
  const missingCount = Object.keys(obj.missing).length;
  let mCount = 0;
  const cp = obj.classpath;
  cp.push(clientJar);

  // download missing libraries
  for (const item of obj.missing) {
    setHelper(
      `${t("helper.downloadingLib")}: ${item.name} (${mCount}/${missingCount})`
    );
    await downloadFile(item.url, item.path, true);
    mCount++;
  }

  // download missing assets
  const assetIndexPath = path.join(
    dir,
    "assets/indexes",
    `${assetIndex.id}.json`
  );
  try {
    fs.accessSync(assetIndexPath);
  } catch (e) {
    await downloadFile(assetIndex.url, assetIndexPath, true);
  }
  const parsedAssetIndex = JSON.parse(
    fs.readFileSync(assetIndexPath).toString()
  );
  const objs = parsedAssetIndex.objects;
  const objsCount = Object.keys(objs).length;
  let oCount = 0;
  for (const i in objs) {
    const obj = objs[i];
    const hash = obj.hash;
    const startHash = hash.slice(0, 2);
    const p = path.join(dir, "assets/objects", startHash, hash);
    try {
      fs.accessSync(p);
    } catch (e) {
      setHelper(
        `${t(
          "helper.downloadingAsset"
        )}: ${startHash}... (${oCount}/${objsCount})`
      );
      await downloadFile(
        `https://resources.download.minecraft.net/${startHash}/${hash}`,
        p,
        true
      );
    }
    oCount++;
  }

  // inject authlib injector
  if (account.mode === "authlib") {
    try {
      fs.accessSync(authlibInjectorPath);
    } catch (e) {
      setHelper(`${t("downloading")}: authlib-injector`);
      // TODO Need to optimize more here
      await downloadFile(
        "https://authlib-injector.yushi.moe/artifact/35/authlib-injector-1.1.35.jar",
        authlibInjectorPath,
        true
      );
    }
    buff.push(`-javaagent:${authlibInjectorPath}=${account.authserver}`);
  }

  // unzip native libraries
  unzipNatives(nativeDir, obj.natives);

  // === resolve arguments ===
  const argumentsMap = {
    // game args
    auth_player_name: account.name,
    version_name: profile.ver,
    auth_session: `token:${account.token}`,
    game_directory: dir,
    game_assets: path.join(dir, "assets"),
    assets_root: path.join(dir, "assets"),
    assets_index_name: assetIndex.id,
    auth_uuid: account.uuid,
    auth_access_token: account.token,
    user_type: "mojang",
    user_properties: `{}`,
    version_type: parsed.type,
    // jvm args
    natives_directory: nativeDir,
    launcher_name: "Epherome",
    launcher_version: ephVersion,
    classpath: cp.join(":"),
  };

  const reg = /\${([\w]*)}/g;
  const resolveMinecraftArgs = (arr: ClientJsonArguments) => {
    const act = (i: string) => {
      i = i.replace(reg, (_str, key) => {
        const item = argumentsMap[key as keyof typeof argumentsMap];
        if (item) {
          return item;
        } else {
          coreLogger.warn(`key "${key}" not exist on arguments' map`);
          return "undefined";
        }
      });
      buff.push(i);
    };
    for (const i of arr) {
      if (typeof i === "string") act(i);
      else if (isCompliant(i.rules)) {
        if (typeof i.value === "string") act(i.value);
        else i.value.forEach((i) => act(i));
      }
    }
  };

  // jvm arguments
  if (parsed.arguments && parsed.arguments.jvm) {
    resolveMinecraftArgs(parsed.arguments.jvm);
  } else {
    if (osName === "darwin") {
      buff.push("-Xdock:name=Minecraft");
    }
    buff.push(
      `-Dminecraft.client.jar=${clientJar}`,
      `-Djava.library.path=${argumentsMap.natives_directory}`,
      `-Dminecraft.launcher.brand=${argumentsMap.launcher_name}`,
      `-Dminecraft.launcher.version=${argumentsMap.launcher_version}`,
      `-cp`,
      argumentsMap.classpath
    );
  }
  profile.jvmArgs && buff.push(profile.jvmArgs);
  buff.push(parsed["mainClass"]);

  // game arguments
  if (parsed.arguments) {
    resolveMinecraftArgs(parsed.arguments.game);
  } else if (parsed.minecraftArguments) {
    resolveMinecraftArgs(parsed.minecraftArguments.split(" "));
  }

  const versionDetail = parseMinecraftVersionDetail(parsed.id);
  const javaVersion = java.name;
  if (
    isJava16Required(versionDetail) &&
    javaVersion &&
    +javaVersion.split(".")[0] < 16
  ) {
    coreLogger.warn(
      `Minecraft version is higher than 1.17 but is using a java version under 16`
    );
    showJava16RequiredDialog();
    options.onDone();
  } else {
    // start minecraft process
    runMinecraft(java.dir, buff, dir, options.onDone, options.profile);
  }
}
