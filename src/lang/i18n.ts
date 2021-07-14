import { Language, LanguageTranslator } from "./languages";
import { DefaultFunction } from "../tools/types";
import { unwrapFunction } from "../tools";

export interface I18nOptions {
  language: string;
  fallback: Language;
  languages: Language[];
}

// simple i18n toolkit
export class I18n {
  language: Language;
  languages: Language[];
  constructor(options: I18nOptions) {
    this.language = options.fallback;
    this.languages = options.languages;
    this.changeLanguage(options.language);
  }
  private languageListener = unwrapFunction();
  listen(listener: DefaultFunction): void {
    this.languageListener = listener;
  }
  get currentTranslator(): LanguageTranslator {
    return this.language.translator;
  }
  changeLanguage = (name: string): void => {
    for (const i of this.languages) {
      if (i.name === name) {
        this.language = i;
      }
    }
    this.languageListener();
  };
}
