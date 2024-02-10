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

type ChangeLanguageCallback = (code: string) => unknown;

class IntlStore {
  languages: Language[];
  fn?: ChangeLanguageCallback;
  constructor(languages: Language[]) {
    this.languages = languages;
  }
  subscribe = (fn: ChangeLanguageCallback) => {
    this.fn = fn;
  };
  updateLanguage = (code: string) => {
    const lang = this.languages.find((x) => x.code === code);
    if (lang) {
      t = deepMerge(root.messages, lang.messages as Partial<LanguageMessages>);
      cfg.language = code;
      this.fn && this.fn(code);
    }
  };
}

export const intlStore = new IntlStore([root, zhCn]);

// load language in the config
intlStore.updateLanguage(cfg.language);
