import { createMuiTheme } from "@material-ui/core";
import { lightBlue } from "@material-ui/core/colors";
import { createHashHistory } from "history";
import log from "electron-log";
import { I18n } from "../tools/i18n";
import { constraints, readConfig, writeConfig } from "./config";

const systemLanguage = navigator.language;
const defaultLanguage = systemLanguage.startsWith("zh") ? "zh-cn" : "en-us";
const lang = readConfig("language", defaultLanguage);

// global i18n toolkit class
export const i18n = new I18n({
  language: lang,
  messages: {
    "en-us": require("../../assets/lang/en-us.json5"),
    "zh-cn": require("../../assets/lang/zh-cn.json5"),
  },
});

const java = readConfig("javaPath", undefined);
if (java === undefined) {
  writeConfig("javaPath", constraints.javaHome, true);
}

// global i18n translator shortcut
export const t = i18n.shortcut();

// global material-ui theme
export const theme = createMuiTheme({
  palette: {
    primary: {
      main: lightBlue[600],
      contrastText: "#ffffff",
    },
  },
});

// renderer process logger
export const logger = log.scope("renderer");

// global history for react-router
export const hist = createHashHistory();
