import fs from "fs";
import path from "path";
import { MinecraftProfile } from "../renderer/profiles";
import { MinecraftAccount, updateAccountToken } from "../renderer/accounts";
import { authenticate, refresh, validate } from "../tools/auth";
import { analyzeLibrary } from "./libraries";
import { constraints } from "../renderer/config";
import { t } from "../renderer/global";
import { ClientJson, mergeClientJson } from "./struct";
import { osName, osVer } from "./rules";
import { unzipNatives } from "./unzip";
import { runMinecraft } from "./runner";
import { downloadFile } from "./download";
import { Logger } from "../tools/logging";
import { DefaultFunction } from "../tools/types";

// logger for minecraft launch core
export const coreLogger = new Logger("Core");

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
  onDone: DefaultFunction;
  onErr: (error: Error) => void;
}

export async function launchMinecraft(options: MinecraftLaunchOptions): Promise<void> {
  const defaultHelper = t.launching;
  coreLogger.info("Launching Minecraft ...");
  const account = options.account;
  const profile = options.profile;
  const java = options.java;
  const details: MinecraftLaunchDetail[] = [];
  const setHelper = options.setHelper;
  const authlibInjectorPath = path.join(constraints.dir, "authlib-injector-1.1.35.jar");

  const buff = [];
  const dir = profile.dir;
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
              updateAccountToken(account.id, result.token);
            }
          };
          coreLogger.warn("Failed to refresh token, requesting for password");
          await act(false);
        } else {
          updateAccountToken(account.id, refreshed.token);
        }
      }
    } else if (account.mode === "microsoft") {
      // TODO Validate Microsoft Account Token
    }
  } else {
    coreLogger.info("Network not available, account validating skipped");
  }
  nextDetail(t.progress.analyze);

  let parsed: ClientJson = JSON.parse(
    fs.readFileSync(path.join(dir, "versions", profile.ver, `${profile.ver}.json`)).toString()
  );

  if (parsed.inheritsFrom) {
    // with mod loader
    withModLoader = true;
    const inheritsFrom = parsed.inheritsFrom;
    const inherit: ClientJson = JSON.parse(
      fs.readFileSync(path.join(dir, "versions", inheritsFrom, `${inheritsFrom}.json`)).toString()
    );
    const newParsed = mergeClientJson(parsed, inherit);
    newParsed && (parsed = newParsed);
  } else if (parsed.patches) {
    // with hmcl patch
    // Note that HMCL will combine both vanilla and mod loader to the same JSON file, so we need a special way to analyze it
    withHMCLPatch = true;
  }

  const clientJar = parsed.jar // use jar file in json if it has
    ? path.join(dir, "versions", parsed.jar, `${parsed.jar}.jar`)
    : path.join(dir, "versions", profile.ver, `${profile.ver}.jar`);
  const nativeDir = path.join(dir, "versions", profile.ver, `${profile.ver}-natives`);

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
  const obj = analyzeLibrary(dir, parsed.libraries);
  const assetIndex = parsed.assetIndex;
  nextDetail(t.progress.downloading);

  const missingCount = Object.keys(obj.missing).length;
  let mCount = 0;
  for (const item of obj.missing) {
    setHelper(`${t.helper.downloadingLib}: ${item.name} (${mCount}/${missingCount})`);
    await downloadFile(item.url, item.path, true);
    mCount++;
  }
  const assetIndexPath = path.join(dir, "assets/indexes", `${assetIndex.id}.json`);
  try {
    fs.accessSync(assetIndexPath);
  } catch (e) {
    await downloadFile(assetIndex.url, assetIndexPath, true);
  }
  const parsedAssetIndex = JSON.parse(fs.readFileSync(assetIndexPath).toString());
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
      setHelper(`${t.helper.downloadingAsset}: ${startHash}... (${oCount}/${objsCount})`);
      await downloadFile(`https://resources.download.minecraft.net/${startHash}/${hash}`, p, true);
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
  buff.push("-cp", cp.join(path.delimiter));
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
    path.join(dir, "assets"),
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
