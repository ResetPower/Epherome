import { t } from "./global";

// get title text from a uri
export function resolveTitle(path: string): string {
  switch (path) {
    case "/":
      return t.epherome;
    case "/accounts":
      return t.accounts;
    case "/profiles":
      return t.profiles;
    case "/settings":
      return t.settings;
    case "/downloads":
      return t.downloads;
    case "/processes":
      return t.processes;
    case "/extensions":
      return t.extensions;
    default:
      return "";
  }
}
