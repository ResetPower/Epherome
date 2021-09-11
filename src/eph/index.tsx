import "@fontsource/roboto";
import "styles/index.css";
import { render } from "react-dom";
import App from "./renderer/App";
import EpheromeLogo from "assets/Epherome.png";
import { themeStore } from "./renderer/theme";
import { ipcRenderer } from "electron";
import { EphExtension, extensionStore } from "common/stores/extension";
import { ephExtPath } from "common/struct/config";

console.log("Hello, World!");

console.log(window.native.hello());

// load theme before splash
themeStore.updateTheme();

const splash = `
<div class="flex flex-col justify-center items-center h-full">
  <img src=${EpheromeLogo} width="100" height="100" />
  <p class="text-2xl font-semibold p-6">Epherome</p>
  <svg class="animate-spin h-7 w-7 text-gray-700 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
</div>
`;

const root = document.getElementById("root");
root && (root.innerHTML = splash);

// mount application after extensions load done
ipcRenderer
  .invoke("load-ext", ephExtPath)
  .then((extensions: EphExtension[]) => {
    extensionStore.extensions = extensions;
    render(<App />, root);
  });
