import { ipcRenderer } from "electron";
import colors from "./colors";
import { historyStore } from "./history";
import { rendererLogger } from "common/loggers";
import { EphTheme } from "./theme";

// global themes
export const lightTheme: EphTheme = {
  type: "light",
  palette: {
    background: colors.gray["100"],
    primary: colors.blue["500"],
    secondary: colors.pink["500"],
    shallow: colors.gray["400"],
    divider: colors.gray["200"],
    card: colors.white,
    contrast: colors.black,
    danger: colors.red["500"],
  },
};

export const darkTheme: EphTheme = {
  type: "dark",
  palette: {
    background: colors.gray["800"],
    primary: colors.indigo["600"],
    secondary: colors.pink["400"],
    shallow: colors.coolGray["400"],
    divider: colors.gray["600"],
    card: colors.gray["700"],
    contrast: colors.white,
    danger: colors.red["400"],
  },
};

// response main-process calls
ipcRenderer.on("nav-back", historyStore.back);
ipcRenderer.on("nav-home", () => historyStore.push("home"));

// catch global errors
window.addEventListener("error", (event) => {
  rendererLogger.error(
    `Renderer Process Error: ${event.error} (at ${event.filename}:${event.lineno}:${event.colno})`
  );
});
