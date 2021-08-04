import { configStore } from "../struct/config";
import { format } from "util";
import enUs from "./en-us";
import jaJp from "./ja-jp";
import { LanguageDefinition } from "./definition";
import zhCn from "./zh-cn";

export interface Language {
  name: string; // eg `en-us`
  nativeName: string; // eg `English`
  definition: LanguageDefinition;
}

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
