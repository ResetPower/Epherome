import { app, os, path } from "@tauri-apps/api";
import { cfg } from "./config";

export const meta = {
  osPlatform: "",
  osVersion: "",
  appVersion: "",
  tauriVersion: "",
  appDataDir: "",
  configFile: "",
};

export async function initMetadata() {
  [
    meta.osPlatform,
    meta.osVersion,
    meta.appVersion,
    meta.tauriVersion,
    meta.appDataDir,
  ] = await Promise.all([
    os.platform(),
    os.version(),
    app.getVersion(),
    app.getTauriVersion(),
    path.appDataDir(),
  ]);
  meta.configFile = await path.resolve(meta.appDataDir, "config.json");
  // load existing config
  await cfg.load();
}
