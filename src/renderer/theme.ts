export interface EphTheme {
  type: "light" | "dark";
  palette: {
    background: string;
    primary: string;
    secondary: string;
    divide: string;
    card: string;
    text: string;
  };
}

export const defineTheme = (theme: EphTheme): EphTheme => theme;
