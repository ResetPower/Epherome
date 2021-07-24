import { I18n } from "../lang/i18n";
import { ephConfigs } from "./config";
import enUs from "../lang/en-us";
import zhCn from "../lang/zh-cn";
import jaJp from "../lang/ja-jp";
import { ipcRenderer } from "electron";
import { EphHistory } from "../tools/history";
import { Logger } from "../tools/logging";
import { defineTheme } from "./theme";
import colors from "./colors";

// global i18n toolkit
const lang = ephConfigs.language;
export const i18n = new I18n({
  language: lang,
  fallback: enUs,
  languages: [enUs, zhCn, jaJp],
});

export let t = i18n.currentTranslator;
i18n.listen(() => (t = i18n.currentTranslator));

// global themes

export const lightTheme = defineTheme({
  type: "light",
  palette: {
    background: colors.gray["100"],
    primary: colors.blue["500"],
    secondary: colors.pink["500"],
    shallow: colors.gray["500"],
    divide: colors.gray["200"],
    card: colors.white,
  },
});

export const darkTheme = defineTheme({
  type: "dark",
  palette: {
    background: colors.gray["800"],
    primary: colors.indigo["600"],
    secondary: colors.pink["500"],
    shallow: colors.coolGray["400"],
    divide: colors.gray["600"],
    card: colors.gray["700"],
  },
});

// renderer process logger
export const logger = new Logger("Renderer");

// global history
export const hist = new EphHistory(/* animation timeout */ 120);

// response main-process calls
ipcRenderer.on("nav-back", hist.goBack);
ipcRenderer.on("nav-home", () => hist.push("home"));
