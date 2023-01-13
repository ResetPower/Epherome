import "@resetpower/rcs/styles/index.css";
import "../styles/index.css";
import { createRoot } from "react-dom/client";
import App from "./renderer/App";
import { rendererLogger } from "common/loggers";
import { ipcRenderer } from "electron";
import path from "path";
import { userDataPath } from "common/utils/info";
import { extensionStore } from "common/stores/extension";
import { rcsDark, rcsLight, ThemeManager } from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import { personalStore, validateEphToken } from "common/stores/personal";
import { ensureDir } from "common/utils/files";
import { initializeJava } from "common/struct/java";

console.log("Hello, World!");

// catch global errors
window.addEventListener("error", (event) => {
  rendererLogger.error(
    `Renderer Process Error: ${event.error} (at ${event.filename}:${event.lineno}:${event.colno})`
  );
});

// load theme before splash
const manager = new ThemeManager(
  () => configStore.themeFollowOs,
  (dark) => {
    setConfig((cfg) => (cfg.theme = dark ? "RCS Dark" : "RCS Light"));
  },
  {
    light: rcsLight,
    dark: rcsDark,
  }
);

updateTheme();

export function updateTheme() {
  manager.responseSystemChange();
  if (!configStore.themeFollowOs) {
    const t = [rcsLight, rcsDark, ...configStore.themeList].find(
      (t) => t.name === configStore.theme
    );
    if (t) {
      manager.apply(t);
    }
  }
}

export default async function launchEpherome(container: HTMLDivElement) {
  const extPath = path.join(userDataPath, "ext");
  ensureDir(extPath);

  // load extensions
  rendererLogger.info("Loading extensions...");
  const [e, s] = await ipcRenderer.invoke("load-extensions", extPath);
  extensionStore.load(e, s);
  rendererLogger.info(`Loaded extensions (Total ${e.length})`);

  await initializeJava();

  // render app
  const root = createRoot(container);
  root.render(<App />);

  // load epherome account avatar
  personalStore.updateHead();

  // login epherome account
  if (configStore.epheromeToken !== "") {
    rendererLogger.info("Validating Epherome account token");
    const valid = await validateEphToken(configStore.epheromeToken);
    if (valid === -1) {
      rendererLogger.warn("Epherome account token is not valid. logging out");
    } else {
      if (valid === 0) {
        rendererLogger.warn("Network not available, skipping check");
      }
    }
    personalStore.autoLogin();
  }
}
