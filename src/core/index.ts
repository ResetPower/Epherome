import fs from "fs";
import path from "path";
import { MinecraftProfile } from "../struct/profiles";
import { MinecraftAccount, updateAccountToken } from "../struct/accounts";
import { authenticate, refresh, validate } from "../craft/auth";
import { analyzeAssets, analyzeLibrary } from "./libraries";
import { ClientJson, ClientJsonArguments, mergeClientJson } from "./struct";
import { isCompliant, osName } from "./rules";
import { unzipNatives } from "./unzip";
import { runMinecraft } from "./runner";
import { createDirIfNotExist, downloadFile } from "./stream";
import { DefaultFn } from "../tools";
import {
  isJava16Required,
  isJava8Required,
  parseMinecraftVersionDetail,
} from "../craft/versions";
import {
  showJava16RequiredDialog,
  showJava8RequiredDialog,
  showNoJavaDialog,
} from "./alerts";
import { Java } from "../struct/java";
import { t } from "../intl";
import { ephVersion } from "../renderer/updater";
import { configStore, userDataPath } from "../struct/config";
import log4js from "log4js";
import { MinecraftUrlUtils } from "../craft/url";
import { Downloader } from "../models/downloader";

// logger for minecraft launch core
export const coreLogger = log4js.getLogger("core");

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

  const buff: string[] = [];
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

  // === analyzing library & assets ===
  const analyzedLibrary = await analyzeLibrary(dir, parsed.libraries);
  const assetIndex = parsed.assetIndex;
  const assetsRoot = path.join(dir, "assets");
  const cp = analyzedLibrary.classpath;
  cp.push(clientJar);

  // download missing libraries
  setHelper(`${t("launching.downloadingLib")} (0%)`);
  await new Promise<void>((resolve) => {
    const downloader = new Downloader({
      taskOptions: analyzedLibrary.missing.map((val) => ({
        url: val.url,
        target: val.path,
      })),
      onDetailsChange: (_, totalPercentage) => {
        setHelper(`${t("launching.downloadingLib")} (${totalPercentage}%)`);
      },
      onError: (error) => {
        throw error;
      },
      onDone: resolve,
      concurrency: configStore.downloadConcurrency,
    });
    downloader.start();
  });

  const analyzedAssets = await analyzeAssets(dir, assetIndex);

  // download missing libraries
  setHelper(`${t("launching.downloadingAsset")} (0%)`);
  await new Promise<void>((resolve) => {
    const downloader = new Downloader({
      taskOptions: analyzedAssets.missing.map((val) => ({
        url: val.url,
        target: val.path,
      })),
      onDetailsChange: (_, totalPercentage) => {
        setHelper(`${t("launching.downloadingAsset")} (${totalPercentage}%)`);
      },
      onError: (error) => {
        throw error;
      },
      onDone: resolve,
      concurrency: configStore.downloadConcurrency,
    });
    downloader.start();
  });

  setHelper(defaultHelper);

  // inject authlib injector
  if (account.mode === "authlib") {
    try {
      fs.accessSync(authlibInjectorPath);
    } catch (e) {
      setHelper(`${t("downloading")}: authlib-injector`);
      // TODO Need to optimize more here
      await downloadFile(
        MinecraftUrlUtils.authlibInjector(),
        authlibInjectorPath
      );
    }
    buff.push(`-javaagent:${authlibInjectorPath}=${account.authserver}`);
  }

  // unzip native libraries
  unzipNatives(nativeDir, analyzedLibrary.natives);

  // === resolve arguments ===
  const argumentsMap = {
    // game args
    auth_player_name: account.name,
    version_name: profile.ver,
    auth_session: `token:${account.token}`,
    game_directory: dir,
    game_assets: assetsRoot,
    assets_root: assetsRoot,
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
    showJava16RequiredDialog(finallyRun);
    options.onDone();
  } else if (isJava8Required(versionDetail) && javaVersion && +javaMajor > 8) {
    coreLogger.warn(
      `Minecraft version is lower than 1.6 but is using a java version higher than 8`
    );
    showJava8RequiredDialog(finallyRun);
    options.onDone();
  } else {
    finallyRun();
  }
}
