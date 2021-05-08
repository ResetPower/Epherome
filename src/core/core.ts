import { spawn } from "child_process";
import StreamZip from "node-stream-zip";
import os from "os";
import fs from "fs";
import log from "electron-log";
import { MinecraftProfile } from "../renderer/profiles";
import { MinecraftAccount, updateAccountToken } from "../renderer/accounts";
import { removeSuffix } from "../tools/strings";
import { analyzeLibrary, analyzeModLibrary } from "./libraries";
import { authenticate, refresh, validate } from "../tools/auth";

const OPERATING_SYSTEM = os.platform();
const OPERATING_VERSION = os.release();

export function sleep(_ms: number): Promise<void> {
  return new Promise((resolve) => resolve());
}

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
  setHelper: (value: ((prevState: string) => string) | string) => void;
  setDetails: (value: MinecraftLaunchDetail[]) => void;
  requestPassword: (again: boolean) => Promise<string>;
  onDone: () => void;
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
  await sleep(1000);
  const dir = removeSuffix(profile.dir, "/");
  const data = fs.readFileSync(`${dir}/versions/${profile.ver}/${profile.ver}.json`);
  const parsed = JSON.parse(data.toString());
  const buff = [];
  const clientJar = `${dir}/versions/${profile.ver}/${profile.ver}.jar`;
  const nativeDir = `${dir}/versions/${profile.ver}/${profile.ver}-natives`;
  let withModLoader = false;
  let parsedInheritsFrom: any;
  function analyzeVanilla(parsed: any) {
    if (parsed.hasOwnProperty("arguments")) {
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
    }
  }
  if (parsed.hasOwnProperty("inheritsFrom")) {
    // with mod loader
    withModLoader = true;
    const inheritsFrom = parsed.inheritsFrom;
    const data = fs.readFileSync(`${dir}/versions/${inheritsFrom}/${inheritsFrom}.json`);
    parsedInheritsFrom = JSON.parse(data.toString());
    analyzeVanilla(parsedInheritsFrom);
  } else {
    // vanilla minecraft
    analyzeVanilla(parsed);
  }
  try {
    fs.accessSync(nativeDir);
  } catch (e) {
    fs.mkdirSync(nativeDir);
  }
  buff.push(
    `-Djava.library.path=${nativeDir}`,
    `-Dminecraft.launcher.brand=Epherome`,
    `-Dminecraft.launcher.version=${process.env.npm_package_version}`
  );
  let obj: any;
  if (withModLoader) {
    const pureLibrary = analyzeLibrary(dir, parsedInheritsFrom.libraries);
    const modLibrary = analyzeModLibrary(dir, parsed.libraries);
    obj = {
      cp: modLibrary.cp.concat(pureLibrary.cp),
      missing: modLibrary.missing.concat(pureLibrary.missing),
      nativeLibs: modLibrary.nativeLibs.concat(pureLibrary.nativeLibs),
    };
  } else {
    obj = analyzeLibrary(dir, parsed.libraries);
  }
  doneAnalyzeJson();

  const doneDownload = useMinecraftLaunchDetail("Download missing assets and libraries");
  await sleep(1000);
  doneDownload();

  const doneUnzip = useMinecraftLaunchDetail("Unzipping");
  await sleep(1000);
  const nativeLibs = obj["nativeLibs"];
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
  const cp = obj["cp"];
  cp.push(clientJar);
  buff.push("-cp", OPERATING_SYSTEM === "win32" ? cp.join(";") : cp.join(":"));
  buff.push(parsed["mainClass"]);
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
    withModLoader ? parsedInheritsFrom["assetIndex"]["id"] : parsed["assetIndex"]["id"],
    "--uuid",
    account.uuid,
    "--accessToken",
    account.token,
    "--userType",
    "mojang",
    "--versionType",
    parsed["type"]
  );
  if (withModLoader) {
    buff.push(...parsed["arguments"]["game"]);
  }
  let firstTimeToReceiveStdout = true;
  const minecraftProcess = spawn(java, buff, {
    cwd: dir,
  });
  minecraftProcess.stdout.on("data", (data) => {
    if (firstTimeToReceiveStdout) {
      firstTimeToReceiveStdout = false;
      onDone();
    }
    loggerCore.info("[Minecraft] stdout >>> " + data.toString());
  });
  minecraftProcess.stderr.on("data", (data) => {
    loggerCore.info("[Minecraft] stderr >>> " + data.toString());
  });
  minecraftProcess.on("exit", (code: number) => {
    loggerCore.debug("Minecraft process exit, exit code:" + code);
  });
}
