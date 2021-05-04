import { t } from "./global";

const titleMap: { [key: string]: string } = {
  "/": "epherome",
  "/accounts": "accounts",
  "/profiles": "profiles",
  "/settings": "settings",
};

// get title text from a uri
export function resolveTitle(path: string): string {
  if (path.startsWith("/profile/")) {
    return t("profileManagement");
  } else return t(titleMap[path]);
}
