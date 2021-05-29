import { spawn } from "child_process";
import StreamZip from "node-stream-zip";
import os from "os";
import request from "request";
import fs from "fs";
import log from "electron-log";
import { MinecraftProfile } from "../renderer/profiles";
import { MinecraftAccount, updateAccountToken } from "../renderer/accounts";
import { authenticate, refresh, validate } from "../tools/auth";
import { removeSuffix } from "../tools/strings";
import { AnalyzedLibraries, analyzeLibrary } from "./libraries";
import { mkdirByFile } from "../tools/files";
import { constraints } from "../renderer/config";

// must use any at this condition
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Parsed = { [key: string]: any };

export const OPERATING_SYSTEM = os.platform();
export const OPERATING_VERSION = os.release();

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

export async function launchMinecraft(options: MinecraftLaunchOptions): Promise<void> {
  loggerCore.info("Launching Minecraft... ...");
  const account = options.account;
  const profile = options.profile;
  const java = options.java;
  const details: MinecraftLaunchDetail[] = [];
  const onDone = options.onDone;
  const setDetails = options.setDetails;
  const setHelper = options.setHelper;

  function useMinecraftLaunchDetail(text: string): () => void {
    const det = {
      stat: false,
      text,
    };
    details.push(det);
    setDetails(details);
    return () => {
      setDetails(
        details.map((value, index) => {
          if (value.text === text) {
            details[index].stat = true;
            return {
              stat: true,
              text: value.text,
            };
          } else {
            return value;
          }
        })
      );
    };
  }

  setHelper("Launching Minecraft");

  const doneAuthenticating = useMinecraftLaunchDetail("Authenticating");
  if (account.mode === "mojang") {
    if (navigator.onLine) {
      const valid = await validate(account.token);
      if (!valid) {
        const refreshed = await refresh(account.token);
        if (refreshed.err) {
          async function act(again: boolean) {
            const password = await options.requestPassword(again);
            const result = await authenticate(account.email, password);
            if (result.err) {
              await act(true);
            } else {
              updateAccountToken(account.id, result.token);
            }
          }
          await act(false);
          loggerCore.warn("Failed to refresh token");
        } else {
          updateAccountToken(account.id, refreshed.token);
        }
      }
    } else {
      // network not available, account validating skipped
    }
  }
  doneAuthenticating();

  const doneAnalyzeJson = useMinecraftLaunchDetail("Analyze JSON");
  const dir = removeSuffix(profile.dir, "/");
  const data = fs.readFileSync(`${dir}/versions/${profile.ver}/${profile.ver}.json`);
  const parsed: Parsed = JSON.parse(data.toString());
  const buff = [];
  let parsedVanilla: Parsed;
  let parsedMod: Parsed = {};
  let withModLoader = false;
  let withHMCLPatch = false;

  if ("inheritsFrom" in parsed) {
    // with mod loader
    withModLoader = true;
    const inheritsFrom = parsed.inheritsFrom;
    const data = fs.readFileSync(`${dir}/versions/${inheritsFrom}/${inheritsFrom}.json`);
    parsedVanilla = JSON.parse(data.toString());
    parsedMod = parsed;
  } else if ("patches" in parsed) {
    // with hmcl patch
    // NOTE: HMCL will combine both vanilla and mod loader to the same JSON file, so we need a special way to analyze it.
    withHMCLPatch = true;
    parsedVanilla = parsed;
  } else {
    // without mod loader
    parsedVanilla = parsed;
  }

  const clientJar =
    "jar" in parsedMod
      ? `${dir}/versions/${parsedMod.jar}/${parsedMod.jar}.jar`
      : `${dir}/versions/${profile.ver}/${profile.ver}.jar`;
  const nativeDir = `${dir}/versions/${profile.ver}/${profile.ver}-natives`;

  if ("arguments" in parsedVanilla) {
    // 1.13, 1.13+
    if (OPERATING_SYSTEM === "darwin") {
      // macos
      buff.push("-XstartOnFirstThread", "-Xdock:name=Minecraft");
    } else if (OPERATING_SYSTEM === "win32") {
      // windows
      buff.push(
        "-XX:HeapDumpPath=MojangTricksIntelDriversForPerformance_javaw.exe_minecraft.exe.heapdump"
      );
      if (OPERATING_VERSION.startsWith("10")) {
        // windows 10
        buff.push("-Dos.name=Windows 10", "-Dos.version=10.0");
      }
    }
    buff.push("-Xss1M");
  } else {
    // 1.12, 1.12-
    buff.push(`-Dminecraft.client.jar=${clientJar}`);
    if (OPERATING_SYSTEM === "darwin") {
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
  let obj: AnalyzedLibraries;
  if (withModLoader) {
    const pureLibrary = analyzeLibrary(dir, parsedVanilla.libraries);
    const modLibrary = analyzeLibrary(dir, parsedMod.libraries);
    obj = {
      classpath: modLibrary.classpath.concat(pureLibrary.classpath),
      missing: modLibrary.missing.concat(pureLibrary.missing),
      nativeLibs: modLibrary.nativeLibs.concat(pureLibrary.nativeLibs),
    };
  } else {
    obj = analyzeLibrary(dir, parsedVanilla.libraries);
  }
  doneAnalyzeJson();

  const doneDownload = useMinecraftLaunchDetail("Download missing assets and libraries");
  for (const item of obj.missing) {
    setHelper("Downloading: " + item.name);
    try {
      fs.accessSync(item.path);
    } catch (e) {
      mkdirByFile(item.path);
    }
    const req = request(item.url, { method: "GET" });
    const stream = fs.createWriteStream(item.path);
    req.pipe(stream);
    const wait = new Promise((resolve) => stream.on("finish", resolve));
    await wait;
  }
  doneDownload();

  setHelper("Launching Minecraft");

  const doneUnzip = useMinecraftLaunchDetail("Unzipping");
  const nativeLibs: Parsed = obj.nativeLibs;
  for (const i in nativeLibs) {
    const file = nativeLibs[i];
    const zip = new StreamZip({
      file: file,
      storeEntries: true,
    });
    zip.on("ready", () => {
      zip.extract(null, nativeDir, (err, count) => {
        zip.close();
        if (err) {
          loggerCore.error(`Error Occurred in Unzipping File "${file}". Unzipped ${count} Files.`);
        }
      });
    });
  }
  doneUnzip();

  useMinecraftLaunchDetail("Running");
  const cp = obj.classpath;
  cp.push(clientJar);
  buff.push("-cp", OPERATING_SYSTEM === "win32" ? cp.join(";") : cp.join(":"));
  buff.push(parsed["mainClass"]);
  if (withModLoader || withHMCLPatch) {
    const p = withModLoader ? parsedMod : parsedVanilla;
    if ("arguments" in p) {
      const arr = p.arguments.game;
      for (const i in arr) {
        const arg = arr[i];
        if (arg.startsWith("--")) {
          const nextArg = arr[parseInt(i) + 1];
          nextArg.indexOf("$") === -1 && buff.push(arg, nextArg);
        }
      }
    } else if ("minecraftArguments" in p) {
      const arr = p.minecraftArguments.split(" ");
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
    parsedVanilla.assetIndex.id,
    "--uuid",
    account.uuid,
    "--accessToken",
    account.token,
    "--userType",
    "mojang",
    "--versionType",
    parsed["type"]
  );
  let firstTimeToReceiveStdout = true;
  console.log(buff);
  const minecraftProcess = spawn(java, buff, {
    cwd: dir,
  });
  minecraftProcess.on("error", (err) => options.onErr(err));
  minecraftProcess.stdout.on("data", () => {
    if (firstTimeToReceiveStdout) {
      firstTimeToReceiveStdout = false;
      onDone();
    }
  });
  minecraftProcess.stdout.on("data", (data) => {
    loggerCore.log("minecraft out >> " + data);
  });
  minecraftProcess.stderr.on("data", (data) => {
    loggerCore.log("minecraft err >> " + data);
  });
}
