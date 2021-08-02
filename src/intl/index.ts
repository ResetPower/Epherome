import { configStore } from "../struct/config";
import { format } from "../tools";
import enUs from "./en-us";
import jaJp from "./ja-jp";
import { Language, LanguageDefinition } from "./languages";
import zhCn from "./zh-cn";

export class IntlStore {
  languages: Language[];
  language?: Language;
  constructor(languages: Language[], fallback: string) {
    this.languages = languages;
    this.setLanguage(fallback);
  }
  setLanguage(name: string): void {
    this.language = this.languages.find((val) => val.name === name);
  }
}

// the only instance of IntlStore
export const intlStore = new IntlStore(
  [enUs, jaJp, zhCn],
  configStore.language
);

// translator function
export function t(key: keyof LanguageDefinition, ...args: string[]): string {
  return format(intlStore.language?.definition[key] ?? "", ...args);
}
