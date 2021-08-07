import { ipcRenderer } from "electron";
import { defineTheme } from "./theme";
import colors from "./colors";
import { historyStore } from "./history";
import log4js from "log4js";

// global themes
export const lightTheme = defineTheme({
  type: "light",
  palette: {
    background: colors.gray["100"],
    primary: colors.blue["500"],
    secondary: colors.pink["500"],
    shallow: colors.gray["500"],
    divider: colors.gray["200"],
    card: colors.white,
    contrast: colors.black,
  },
});

export const darkTheme = defineTheme({
  type: "dark",
  palette: {
    background: colors.gray["800"],
    primary: colors.indigo["600"],
    secondary: colors.pink["400"],
    shallow: colors.coolGray["400"],
    divider: colors.gray["600"],
    card: colors.gray["700"],
    contrast: colors.white,
  },
});

// renderer process logger
export const logger = log4js.getLogger("renderer");

// response main-process calls
ipcRenderer.on("nav-back", historyStore.back);
ipcRenderer.on("nav-home", () => historyStore.push("home"));

// catch global errors
window.addEventListener("error", (event) => {
  logger.error(
    `Renderer Process Error: ${event.error} (at ${event.filename}:${event.lineno}:${event.colno})`
  );
});
