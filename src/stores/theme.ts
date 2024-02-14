import { cfg } from "./config";

const media = window.matchMedia("(prefers-color-scheme: dark)");
const html = document.querySelector("html") as HTMLHtmlElement;

export type Theme = "light" | "dark" | "follow";

class ThemeStore {
  theme = cfg.theme;
  private calcTheme(): "light" | "dark" {
    if (this.theme === "follow") {
      return media.matches ? "dark" : "light";
    } else return this.theme;
  }
  loadTheme() {
    html.className = this.calcTheme() === "light" ? String() : "dark";
  }
  updateTheme(theme: Theme) {
    this.theme = theme;
    this.loadTheme();
  }
}

export const themeStore = new ThemeStore();

media.addEventListener("change", () => themeStore.loadTheme());

themeStore.loadTheme();
