import fs from "fs";
import log from "electron-log";
import { MinecraftProfile } from "../renderer/profiles";
import { MinecraftAccount, updateAccountToken } from "../renderer/accounts";
import { authenticate, refresh, validate } from "../tools/auth";
import { removeSuffix } from "../tools/strings";
import { analyzeLibrary } from "./libraries";
import { constraints } from "../renderer/config";
import { t } from "../renderer/global";
import { ClientLibraryResult, ClientJson, mergeClientJson } from "./struct";
import { osName, osVer } from "./rules";
import { unzipNatives } from "./unzip";
import { runMinecraft } from "./runner";
import { downloadFile } from "./download";

// logger for minecraft launch core
export const loggerCore = log.scope("core");

export interface MinecraftLaunchDetail {
  text: string;
  stat: boolean;
}

export interface MinecraftLaunchOptions {
  account: MinecraftAccount;
  profile: MinecraftProfile;
  java: string;
  setHelper: (value: string) => void;
  setDetails: (value: MinecraftLaunchDetail[]) => void;
  requestPassword: (again: boolean) => Promise<string>;
  onDone: () => void;
  onErr: (error: Error) => void;
}

async function authCheck(
  account: MinecraftAccount,
  req: (again: boolean) => Promise<string>
): Promise<void> {
  if (account.mode === "mojang" || account.mode === "authlib") {
    const server = account.mode === "mojang" ? undefined : account.authserver;
    const valid = await validate(account.token, server);
    if (!valid) {
      const refreshed = await refresh(account.token, server);
      if (refreshed.err) {
        const act = async (again: boolean) => {
          const password = await req(again);
          const result = await authenticate(account.email, password, server);
          if (result.err) {
            await act(true);
          } else {
            updateAccountToken(account.id, result.token);
          }
        };
        await act(false);
        loggerCore.warn("Failed to refresh token");
      } else {
        updateAccountToken(account.id, refreshed.token);
      }
    }
  } else if (account.mode === "microsoft") {
    // TODO Validate Microsoft Account Token
  }
}

export async function launchMinecraft(options: MinecraftLaunchOptions): Promise<void> {
  const defaultHelper = t.launching;
  loggerCore.info("Launching Minecraft... ...");
  const account = options.account;
  const profile = options.profile;
  const java = options.java;
  const details: MinecraftLaunchDetail[] = [];
  const setHelper = options.setHelper;
  const authlibInjectorPath = `${constraints.dir}/authlib-injector-1.1.35.jar`;

  const buff = [];
  let withModLoader = false;
  let withHMCLPatch = false;
  let withAuthlibInjector = false;

  const nextDetail = (text: string) => {
    const count = details.length - 1;
    if (count >= 0) {
      details[count].stat = true;
    }
    details.push({
      stat: false,
      text,
    });
    options.setDetails(details);
    setHelper(defaultHelper);
  };
  nextDetail(t.progress.auth);

  if (navigator.onLine) {
    authCheck(account, options.requestPassword);
  } else {
    loggerCore.info("Network not available, account validating skipped");
  }
  nextDetail(t.progress.analyze);

  const dir = removeSuffix(removeSuffix(profile.dir, "/"), "\\"); // remove both *nix sep `/` and windows sep `\`
  let parsed: ClientJson = JSON.parse(
    fs.readFileSync(`${dir}/versions/${profile.ver}/${profile.ver}.json`).toString()
  );

  if (parsed.inheritsFrom) {
    // with mod loader
    withModLoader = true;
    const inheritsFrom = parsed.inheritsFrom;
    const inherit: ClientJson = JSON.parse(
      fs.readFileSync(`${dir}/versions/${inheritsFrom}/${inheritsFrom}.json`).toString()
    );
    parsed = mergeClientJson(inherit, parsed);
  } else if (parsed.patches) {
    // with hmcl patch
    // Note that HMCL will combine both vanilla and mod loader to the same JSON file, so we need a special way to analyze it
    withHMCLPatch = true;
  }

  const clientJar = parsed.jar
    ? `${dir}/versions/${parsed.jar}/${parsed.jar}.jar`
    : `${dir}/versions/${profile.ver}/${profile.ver}.jar`;
  const nativeDir = `${dir}/versions/${profile.ver}/${profile.ver}-natives`;

  if (parsed.arguments) {
    // 1.13, 1.13+
    if (osName === "darwin") {
      buff.push("-XstartOnFirstThread", "-Xdock:name=Minecraft");
    } else if (osName === "win32") {
      buff.push(
        "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump"
      );
      if (osVer.startsWith("10")) {
        buff.push("-Dos.name=Windows 10", "-Dos.version=10.0");
      }
    }
    buff.push("-Xss1M");
  } else {
    buff.push(`-Dminecraft.client.jar=${clientJar}`);
    if (osName === "darwin") {
      buff.push("-Xdock:name=Minecraft");
    }
  }

  try {
    fs.accessSync(nativeDir);
  } catch (e) {
    fs.mkdirSync(nativeDir);
  }
  buff.push(
    `-Djava.library.path=${nativeDir}`,
    `-Dminecraft.launcher.brand=Epherome`,
    `-Dminecraft.launcher.version=${constraints.version}`
  );
  let obj: ClientLibraryResult;
  if (withModLoader) {
    const pureLibrary = analyzeLibrary(dir, parsed.libraries);
    const modLibrary = analyzeLibrary(dir, parsed.libraries);
    obj = {
      classpath: modLibrary.classpath.concat(pureLibrary.classpath),
      missing: modLibrary.missing.concat(pureLibrary.missing),
      natives: modLibrary.natives.concat(pureLibrary.natives),
    };
  } else {
    obj = analyzeLibrary(dir, parsed.libraries);
  }
  const assetIndex = parsed.assetIndex;
  nextDetail(t.progress.downloading);

  const missingCount = Object.keys(obj.missing).length;
  let mCount = 0;
  for (const item of obj.missing) {
    setHelper(`${t.helper.downloadingLib}: ${item.name} (${mCount}/${missingCount})`);
    await downloadFile(item.url, item.path, true);
    mCount++;
  }
  const assetIndexPath = `${dir}/assets/indexes/${assetIndex.id}.json`;
  try {
    fs.accessSync(assetIndexPath);
  } catch (e) {
    await downloadFile(assetIndex.url, assetIndexPath, true);
  }
  const parsedAssetIndex = JSON.parse(fs.readFileSync(assetIndexPath).toString());
  const objs = parsedAssetIndex.objects;
  const objsCount = Object.keys(objs).length;
  let oCount = 0;
  for (const i in parsedAssetIndex.objects) {
    const obj = objs[i];
    const hash = obj.hash;
    const startHash = hash.slice(0, 2);
    const path = `${dir}/assets/objects/${startHash}/${hash}`;
    try {
      fs.accessSync(path);
    } catch (e) {
      setHelper(`${t.helper.downloadingAsset}: ${startHash}... (${oCount}/${objsCount})`);
      await downloadFile(
        `https://resources.download.minecraft.net/${startHash}/${hash}`,
        path,
        true
      );
    }
    oCount++;
  }
  if (account.mode === "authlib") {
    withAuthlibInjector = true;
    try {
      fs.accessSync(authlibInjectorPath);
    } catch (e) {
      setHelper(`${t.downloading}: authlib-injector`);
      // TODO Need to optimize more here
      await downloadFile(
        "https://authlib-injector.yushi.moe/artifact/35/authlib-injector-1.1.35.jar",
        authlibInjectorPath,
        true
      );
    }
  }
  nextDetail(t.progress.unzipping);

  unzipNatives(nativeDir, obj.natives);
  nextDetail(t.progress.running);

  const cp = obj.classpath;
  cp.push(clientJar);
  if (withAuthlibInjector) {
    buff.push(`-javaagent:${authlibInjectorPath}=${account.authserver}`);
  }
  buff.push("-cp", osName === "win32" ? cp.join(";") : cp.join(":"));
  buff.push(parsed["mainClass"]);
  if (withModLoader || withHMCLPatch) {
    if (parsed.arguments) {
      const arr = parsed.arguments.game;
      for (const i in arr) {
        const arg = arr[i];
        if (typeof arg === "string" && arg.startsWith("--")) {
          const nextArg = arr[parseInt(i) + 1];
          if (typeof nextArg === "string") {
            nextArg.indexOf("$") === -1 && buff.push(arg, nextArg);
          }
        }
      }
    } else if (parsed.minecraftArguments) {
      const arr = parsed.minecraftArguments.split(" ");
      for (const i in arr) {
        const arg = arr[i];
        if (arg.startsWith("--")) {
          const nextArg = arr[parseInt(i) + 1];
          nextArg.indexOf("$") === -1 && buff.push(arg, nextArg);
        }
      }
    }
  }

  buff.push(
    "--username",
    account.name,
    "--version",
    profile.ver,
    "--gameDir",
    dir,
    "--assetsDir",
    `${dir}/assets`,
    "--assetIndex",
    assetIndex.id,
    "--uuid",
    account.uuid,
    "--accessToken",
    account.token,
    "--userType",
    "mojang",
    "--versionType",
    parsed["type"]
  );

  // start minecraft process
  runMinecraft(java, buff, dir, options.onErr, options.onDone);
}
