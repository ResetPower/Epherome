import { configStore, setConfig } from "common/struct/config";
import { format, StringMap } from "common/utils";
import enUs from "./en-us";
import jaJp from "./ja-jp";
import zhCn from "./zh-cn";
import { action, makeObservable, observable } from "mobx";
import ruRu from "./ru-ru";
import { Hyperlink } from "@resetpower/rcs";
import { openInBrowser } from "common/utils/open";

export type LanguageDefinition = typeof enUs.definition;

export type KeyOfLanguageDefinition = keyof LanguageDefinition;

export interface Language {
  name: string; // eg `en-us`
  nativeName: string; // eg `English`
  definition: StringMap;
}

export class IntlStore {
  languages: Language[];
  @observable language?: Language;
  constructor(languages: Language[], fallback: string) {
    this.languages = languages;
    this.setLanguage(fallback, false);
    makeObservable(this);
  }
  @action
  setLanguage(name: string, save?: boolean): void {
    this.language = this.languages.find((val) => val.name === name) ?? enUs;
    setConfig((cfg) => (cfg.language = name), save);
  }
}

// the only instance of IntlStore
export const intlStore = new IntlStore(
  [enUs, jaJp, zhCn, ruRu],
  configStore.language
);

// translator function
export function t(key: KeyOfLanguageDefinition, ...args: string[]): string {
  return format(
    intlStore.language?.definition[key] ?? enUs.definition[key] ?? "",
    ...args
  );
}

export function tLink(
  key: KeyOfLanguageDefinition,
  link: string,
  linkText?: string
): JSX.Element {
  const def = intlStore.language?.definition[key] ?? enUs.definition[key] ?? "";
  const split = def.split("{0}");
  return (
    <div className="flex space-x-1">
      <div>{split[0]}</div>
      <Hyperlink onClick={() => openInBrowser(link)}>{linkText}</Hyperlink>
      <div>{split[1]}</div>
    </div>
  );
}
