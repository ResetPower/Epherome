export interface I18nOptions {
  language: string; // the name of the language
  messages: { [key: string]: { [key: string]: string } }; // the language messages
}

// simple i18n toolkit
export class I18n {
  language: string;
  messages: { [key: string]: { [key: string]: string } };
  constructor(options: I18nOptions) {
    this.language = options.language;
    this.messages = options.messages;
  }
  // translate a string
  t(key: string, args: { [key: string]: string } = {}): string {
    let ret = this.messages[this.language][key];
    // resolve template
    for (const i in args) {
      const v = args[i];
      ret = ret.replace("{" + i + "}", v);
    }
    return ret;
  }
  // the shortcut function of t
  shortcut(): (key: string, args?: { [key: string]: string }) => string {
    return (key: string, args: { [key: string]: string } = {}) => {
      return this.t(key, args);
    };
  }
  // update language
  changeLanguage(name: string): void {
    this.language = name;
  }
}
