import fs from "fs";
import path from "path";
import { MinecraftProfile } from "common/struct/profiles";
import { MinecraftAccount } from "common/struct/accounts";
import { analyzeAssets, analyzeLibrary } from "./libraries";
import { ClientJsonArguments } from "./struct";
import { isCompliant, osName } from "./rules";
import { runMinecraft } from "./runner";
import { ensureDir, downloadFile, parallelDownload } from "common/utils/files";
import { adapt, DefaultFn } from "common/utils";
import {
  isJava16Required,
  isJava8Required,
  parseMinecraftVersionDetail,
} from "./versions";
import { Java } from "common/struct/java";
import { t } from "eph/intl";
import { ephVersion, userDataPath } from "common/utils/info";
import { configStore } from "common/struct/config";
import { MinecraftDownloadProvider, MinecraftUrlUtil } from "core/url";
import { parseJson } from "./parser";
import { coreLogger } from "common/loggers";
import { parseJvmArgs } from "common/struct/java";
import { ObjectWrapper } from "common/utils/object";
import { Process } from "common/stores/process";

export type LaunchCanceller = () => boolean;

export type LaunchOnDone = (process: Process | null) => void;

export interface MinecraftLaunchOptions {
  account: MinecraftAccount;
  profile: MinecraftProfile;
  java?: Java;
  setHelper: (value: string) => void;
  requestPassword: (again: boolean) => Promise<string>;
  onDone: LaunchOnDone;
  cancellerWrapper: ObjectWrapper<LaunchCanceller>;
  provider: MinecraftDownloadProvider;
}

export async function launchMinecraft(
  options: MinecraftLaunchOptions
): Promise<
  ["j8Required" | "j16Required" | "jRequired" | null, DefaultFn | null]
> {
  const urlUtil = new MinecraftUrlUtil(options.provider);
  const cancellerWrapper = options.cancellerWrapper;
  const restoreCanceller = cancellerWrapper.setToDefault;
  const java = options.java;

  if (!java) {
    options.onDone(null);
    return ["jRequired", null];
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
  const customResolution = profile.resolution;

  const buff: string[] = [];

  setHelper(defaultHelper);

  // === parsing json file ===
  const dir = path.resolve(profile.dir);
  const parsed = parseJson(profile);

  let clientJar = parsed.jar // use jar file in json if it has
    ? path.join(dir, "versions", parsed.jar, `${parsed.jar}.jar`)
    : path.join(dir, "versions", profile.ver, `${profile.ver}.jar`);
  const nativeDir = path.join(
    dir,
    "versions",
    profile.ver,
    `${profile.ver}-natives`
  );
  ensureDir(nativeDir);

  if (!fs.existsSync(clientJar) && parsed.inheritsFrom) {
    const inheritsFrom = parsed.inheritsFrom;
    clientJar = path.join(dir, "versions", inheritsFrom, `${inheritsFrom}.jar`);
  }

  // === analyzing library & assets ===
  const analyzedLibrary = await analyzeLibrary(dir, parsed.libraries);
  const assetIndex = parsed.assetIndex;
  const assetsRoot = path.join(dir, "assets");
  const cp = analyzedLibrary.classpath;
  cp.push(clientJar);

  // download missing libraries
  setHelper(`${t("launching.downloadingLib")} (0%)`);
  await parallelDownload(
    analyzedLibrary.missing.map((val) => ({
      url: val.url,
      target: val.path,
    })),
    (_, totalPercentage) => {
      setHelper(`${t("launching.downloadingLib")} (${totalPercentage}%)`);
    },
    (err) => {
      throw err;
    },
    configStore.downloadConcurrency,
    cancellerWrapper
  );
  restoreCanceller();

  const analyzedAssets = await analyzeAssets(dir, assetIndex);

  // download missing libraries
  setHelper(`${t("launching.downloadingAsset")} (0%)`);
  await parallelDownload(
    analyzedAssets.missing.map((val) => ({
      url: val.url,
      target: val.path,
    })),
    (_, totalPercentage) => {
      setHelper(`${t("launching.downloadingAsset")} (${totalPercentage}%)`);
    },
    (err) => {
      throw err;
    },
    configStore.downloadConcurrency,
    cancellerWrapper
  );
  restoreCanceller();

  setHelper(defaultHelper);

  // inject authlib injector
  if (account.mode === "authlib") {
    try {
      fs.accessSync(authlibInjectorPath);
    } catch (e) {
      setHelper(`${t("downloading")}: authlib-injector`);
      // TODO Need to optimize more here
      await downloadFile(urlUtil.authlibInjector(), authlibInjectorPath);
    }
    buff.push(`-javaagent:${authlibInjectorPath}=${account.authserver}`);
  }

  // unzip native libraries
  for (const i of analyzedLibrary.natives) {
    // 借助 Rust 神力解压，法力无边。
    window.native.extractZip(i, nativeDir);
  }

  const gameDir = profile.gameDirIsolation
    ? path.join(dir, "versions", profile.ver)
    : dir;

  // === resolve arguments ===
  const argumentsMap = {
    // game args
    auth_player_name: account.name,
    version_name: profile.ver,
    auth_session: `token:${account.token}`,
    game_directory: gameDir,
    game_assets: assetsRoot,
    assets_root: assetsRoot,
    assets_index_name: assetIndex.id,
    auth_uuid: account.uuid,
    auth_access_token: account.token,
    user_type: "mojang",
    user_properties: `{}`,
    version_type: adapt(profile.showEpherome, undefined, true)
      ? "Epherome"
      : parsed.type,
    // jvm args
    natives_directory: nativeDir,
    launcher_name: "Epherome",
    launcher_version: ephVersion,
    classpath: cp.join(process.platform === "win32" ? ";" : ":"),
    resolution_width: customResolution?.width,
    resolution_height: customResolution?.height,
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
      else if (
        isCompliant(i.rules, {
          has_custom_resolution: !!(
            customResolution &&
            customResolution.width &&
            customResolution.height
          ),
        })
      ) {
        if (typeof i.value === "string") act(i.value);
        else i.value.forEach((i) => act(i));
      }
    }
  };

  // jvm arguments
  profile.jvmArgs &&
    buff.push(
      ...parseJvmArgs(profile.jvmArgs),
      ...(adapt(profile.safeLog4j, undefined, true)
        ? ["-Dlog4j2.formatMsgNoLookups=true"]
        : [])
    );
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
  buff.push(parsed["mainClass"]);

  // game arguments
  if (parsed.arguments) {
    resolveMinecraftArgs(parsed.arguments.game);
  } else if (parsed.minecraftArguments) {
    resolveMinecraftArgs(parsed.minecraftArguments.split(" "));
  }

  const finallyRun = () => {
    runMinecraft(java.dir, buff, dir, options.onDone, options.profile);
  };

  const versionDetail = parseMinecraftVersionDetail(parsed.id);
  const javaVersion = java.name;
  const javaMajor = +javaVersion.split(".")[0];
  if (isJava16Required(versionDetail) && javaVersion && javaMajor < 16) {
    coreLogger.warn(
      `Minecraft version is higher than 1.17 but is using a java version under 16`
    );
    options.onDone(null);
    return ["j16Required", finallyRun];
  } else if (isJava8Required(versionDetail) && javaVersion && +javaMajor > 8) {
    coreLogger.warn(
      `Minecraft version is lower than 1.6 but is using a java version higher than 8`
    );
    options.onDone(null);
    return ["j8Required", finallyRun];
  } else {
    finallyRun();
    return [null, null];
  }
}
