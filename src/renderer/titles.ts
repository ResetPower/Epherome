import { t } from "./global";

const titleMap: { [key: string]: string } = {
  "/": "epherome",
  "/accounts": "accounts",
  "/profiles": "profiles",
  "/settings": "settings",
};

// get title text from a uri
export function resolveTitle(path: string): string {
  return t(titleMap[path]);
}
