const ss = document.documentElement.style;
const html = document.querySelector("html");

export interface EphTheme {
  type: "light" | "dark";
  palette: {
    background: string;
    primary: string;
    secondary: string;
    shallow: string;
    divide: string;
    card: string;
  };
}

export function isDark(): boolean {
  return html?.classList.contains("dark") ?? false;
}

export function applyTheme(theme: EphTheme): void {
  if (theme.type === "dark") {
    html && !html.classList.contains("dark") && html.classList.add("dark");
  } else if (theme.type === "light") {
    html && html.classList.contains("dark") && html.classList.remove("dark");
  }
  ss.setProperty("--eph-background-color", theme.palette.background);
  ss.setProperty("--eph-primary-color", theme.palette.primary);
  ss.setProperty("--eph-secondary-color", theme.palette.secondary);
  ss.setProperty("--eph-shallow-color", theme.palette.shallow);
  ss.setProperty("--eph-divide-color", theme.palette.divide);
  ss.setProperty("--eph-card-color", theme.palette.card);
}

export const defineTheme = (theme: EphTheme): EphTheme => theme;
