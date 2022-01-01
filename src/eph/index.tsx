import "@fontsource/inter";
import "../styles/index.css";
import { render } from "react-dom";
import App from "./renderer/App";
import EpheromeLogo from "assets/Epherome.png";
import { themeStore } from "./renderer/theme";
import { rendererLogger } from "common/loggers";
import { ipcRenderer } from "electron";
import path from "path";
import { userDataPath } from "common/utils/info";
import { extensionStore } from "common/stores/extension";

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
themeStore.updateTheme();

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
const root = document.getElementById("root");
root && (root.innerHTML = splash);

// load extensions
ipcRenderer
  .invoke("load-extensions", path.join(userDataPath, "ext"))
  .then(([e, s]) => extensionStore.load(e, s));

// render app
render(<App />, root);
