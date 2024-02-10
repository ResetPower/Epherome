import { cfg } from "../stores/config";
import { RecursivePartial, deepMerge } from "../utils";
import root from "./root";
import zhCn from "./zh-cn";

export let t = root.messages;

export type LanguageMessages = typeof root.messages;

export interface Language {
  name: string;
  code: string;
  messages: RecursivePartial<LanguageMessages>;
}

export const languages: Language[] = [root, zhCn];

export function updateLanguage(code: string) {
  const lang = languages.find((x) => x.code === code);
  if (lang) {
    t = deepMerge(root.messages, lang.messages as Partial<LanguageMessages>);
    console.log(t);
    cfg.language = code;
  }
}

// load language in the config
updateLanguage(cfg.language);
