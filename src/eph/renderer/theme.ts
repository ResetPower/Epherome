import { configStore, setConfig } from "common/struct/config";
import { darkTheme, lightTheme } from "./global";

const ss = document.documentElement.style;
const html = document.querySelector("html");
const isDark = window.matchMedia("(prefers-color-scheme: dark)");

export interface EphThemePalette {
  background: string;
  primary: string;
  secondary: string;
  shallow: string;
  divider: string;
  card: string;
  contrast: string;
  danger: string;
}

export interface EphTheme {
  type: "light" | "dark";
  palette: EphThemePalette;
}

export const defineTheme = (theme: EphTheme): EphTheme => theme;

export class ThemeStore {
  constructor() {
    // listen to system theme changes
    isDark.addEventListener("change", () => this.updateTheme());
  }
  applyTheme(theme: EphTheme): void {
    theme.type === "dark"
      ? // add class "dark" if theme type is dark
        html && !html.classList.contains("dark") && html.classList.add("dark")
      : // remove class "dark" if theme type is not dark (light)
        html &&
        html.classList.contains("dark") &&
        html.classList.remove("dark");
    // set values of css variables
    const palette = theme.palette;
    for (const k in palette) {
      ss.setProperty(`--eph-${k}-color`, palette[k as keyof EphThemePalette]);
    }
  }
  // set config according to system
  detectSystemTheme(): void {
    const prefersDarkMode = isDark.matches;
    setConfig((cfg) => (cfg.theme = prefersDarkMode ? "dark" : "light"));
  }
  updateTheme(): void {
    if (configStore.themeFollowOs) {
      this.detectSystemTheme();
    }
    this.applyTheme(configStore.theme === "dark" ? darkTheme : lightTheme);
  }
}

export const themeStore = new ThemeStore();
