import { configStore, setConfig } from "common/struct/config";
import { format } from "common/utils";
import enUs from "./en-us";
import jaJp from "./ja-jp";
import { LanguageDefinition } from "./definition";
import zhCn from "./zh-cn";
import { action, makeObservable, observable } from "mobx";

export interface Language {
  name: string; // eg `en-us`
  nativeName: string; // eg `English`
  definition: LanguageDefinition;
}

export class IntlStore {
  languages: Language[];
  @observable language?: Language;
  constructor(languages: Language[], fallback: string) {
    this.languages = languages;
    this.setLanguage(fallback);
    makeObservable(this);
  }
  @action
  setLanguage(name: string): void {
    this.language = this.languages.find((val) => val.name === name);
    setConfig((cfg) => (cfg.language = name));
  }
}

// the only instance of IntlStore
export const intlStore = new IntlStore(
  [enUs, jaJp, zhCn],
  configStore.language
);

export type KeyOfLanguageDefinition = keyof LanguageDefinition;

// translator function
export function t(key: KeyOfLanguageDefinition, ...args: string[]): string {
  return format(intlStore.language?.definition[key] ?? "", ...args);
}
