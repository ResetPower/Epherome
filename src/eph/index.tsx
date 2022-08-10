import "@fontsource/noto-sans";
import "@fontsource/noto-sans-jp";
import "@fontsource/noto-sans-sc";
import "@resetpower/rcs/styles/index.css";
import "../styles/index.css";
import { createRoot } from "react-dom/client";
import App from "./renderer/App";
import EpheromeLogo from "assets/Epherome.png";
import { rendererLogger } from "common/loggers";
import { ipcRenderer } from "electron";
import path from "path";
import { userDataPath } from "common/utils/info";
import { extensionStore } from "common/stores/extension";
import { rcsDark, rcsLight, ThemeManager } from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import { personalStore, validateEphToken } from "common/stores/personal";
import { ensureDir } from "common/utils/files";

console.log("Hello, World!");

// catch global errors
window.addEventListener("error", (event) => {
  rendererLogger.error(
    `Renderer Process Error: ${event.error} (at ${event.filename}:${event.lineno}:${event.colno})`
  );
});

// To see if Rust addon works well.
console.log(window.native.hello());

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
coordinateFont();

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

export function coordinateFont() {
  document.body.style.fontFamily = `Noto Sans, ${
    configStore.language === "ja-jp" ? "Noto Sans JP" : "Noto Sans SC"
  }`;
}

const splash = `
<div class="flex flex-col justify-center items-center h-full">
  <img src="${EpheromeLogo}" width="100" height="100" />
  <p class="text-2xl font-semibold p-6">Epherome</p>
  <svg class="animate-spin h-7 w-7 text-gray-700 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
</div>
`;

// show splash
const container = document.createElement("div");
container.id = "root";
document.body.append(container);
container.innerHTML = splash;

async function launchEpherome() {
  const extPath = path.join(userDataPath, "ext");
  ensureDir(extPath);
  // load extensions
  rendererLogger.info("Loading extensions...");
  const [e, s] = await ipcRenderer.invoke("load-extensions", extPath);
  extensionStore.load(e, s);
  rendererLogger.info(`Loaded extensions (Total ${e.length})`);

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
      personalStore.autoLogin();
    }
  }
}

launchEpherome();
