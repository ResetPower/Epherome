import { Language, LanguageTranslator } from "./languages";
import { broadcast } from "../renderer/session";

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
  currentTranslator = (): LanguageTranslator => this.language.translator;
  changeLanguage = (name: string): void => {
    for (const i of this.languages) {
      if (i.name === name) {
        this.language = i;
      }
    }
    broadcast("lang");
  };
}
