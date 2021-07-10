export interface LanguageTranslator {
  hello: string;
  epherome: string;
  settings: string;
  accounts: string;
  profiles: string;
  launch: string;
  edit: string;
  news: string;
  create: string;
  cancel: string;
  remove: string;
  newAccount: string;
  removeAccount: string;
  newProfile: string;
  removeProfile: string;
  editProfile: string;
  mojang: string;
  microsoft: string;
  authlib: string;
  offline: string;
  email: string;
  password: string;
  username: string;
  authserver: string;
  errCreatingAccount: string;
  confirmRemoving: string;
  name: string;
  directory: string;
  version: string;
  general: string;
  appearance: string;
  about: string;
  os: string;
  cfgFilePath: string;
  officialSite: string;
  oss: string;
  language: string;
  save: string;
  noAccountsYet: string;
  noProfilesYet: string;
  launching: string;
  javaPath: string;
  openDirectory: string;
  usuallyDotMinecraftEtc: string;
  theme: string;
  ok: string;
  passwordWrong: string;
  pleaseInputPassword: string;
  errorOccurred: string;
  manage: string;
  profileManagement: string;
  notSupportedYet: string;
  warning: string;
  alphaWarning: string;
  hitokoto: string;
  download: string;
  clickToLogin: string;
  downloads: string;
  release: string;
  snapshot: string;
  old: string;
  cannotConnectToHitokoto: string;
  hitokotoDescription: string;
  msAccNoMinecraft: string;
  downloading: string;
  official: string;
  downloadProvider: string;
  downloadProviderIsNotAble: string;
  downloadNotSupported: string;
  maps: string;
  resourcePacks: string;
  noAccOrProSelected: string;
  followOs: string;
  progress: {
    auth: string;
    analyze: string;
    downloading: string;
    unzipping: string;
    running: string;
  };
  helper: {
    downloadingAsset: string;
    downloadingLib: string;
  };
}

export interface Language {
  name: string; // eg `en-us`
  nativeName: string; // eg `English`
  translator: LanguageTranslator;
}

export const defineLanguage = (language: Language): Language => language;
