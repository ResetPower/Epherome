import { t } from "./global";

// map of common titles
const titleMap: { [key: string]: string } = {
  "/": "epherome",
  "/accounts": "accounts",
  "/profiles": "profiles",
  "/settings": "settings",
  "/profile": "profileManagement",
  "/downloads": "downloads",
};

// get title text from a uri
export function resolveTitle(path: string): string {
  return t(titleMap[path]);
}
