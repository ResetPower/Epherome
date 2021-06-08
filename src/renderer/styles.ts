import { EphTheme } from "./theme";

const ss = document.documentElement.style;
const html = document.querySelector("html");

export function isDark(): boolean {
  return html?.classList.contains("dark") ?? false;
}

export function applyTheme(theme: EphTheme): void {
  if (theme.type === "dark") {
    html && !html.classList.contains("dark") && html.classList.add("dark");
  }
  ss.setProperty("--eph-background-color", theme.palette.background);
  ss.setProperty("--eph-primary-color", theme.palette.primary);
  ss.setProperty("--eph-secondary-color", theme.palette.secondary);
  ss.setProperty("--eph-text-color", theme.palette.text);
  ss.setProperty("--eph-divide-color", theme.palette.divide);
  ss.setProperty("--eph-card-color", theme.palette.card);
}
