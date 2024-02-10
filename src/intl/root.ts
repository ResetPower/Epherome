export default {
  name: "English",
  code: "en-ww",
  messages: {
    counter: {
      increase: "Increase",
      clicked: (count: number) =>
        `You've clicked the button for ${count} times.`,
    },
    account: "Account",
    profile: "Profile",
    remove: "Remove",
    create: "Create",
    cancel: "Cancel",
    browse: "Browse",
    unsupported: "It is not supported yet.",
    name: "Name",
    username: "Username",
    email: "Email",
    password: "Password",
    sidebar: {
      home: "Home",
      accounts: "Accounts",
      profiles: "Profiles",
      counter: "Counter",
      settings: "Settings",
    },
    home: {
      launch: "Launch",
    },
    accounts: {
      empty: "No accounts here.",
      unopened: "Open an account on the left or create a new account.",
      microsoft: "Microsoft Account",
      authlib: "Authlib Injector",
      offline: "Offline",
      authserver: "Auth Server",
      type: "Account Type",
      removeConfirmation: (name: string) =>
        `Do you really want to remove account ${name}?`,
      token: {
        validate: "Check Token Status",
        available: "Token is available",
        unavailable: "Token is unavailable",
      },
    },
    profiles: {
      empty: "No profiles here.",
      gameDir: "Game Directory",
      gameDirHelper:
        "Usually '.minecraft' on Windows or 'minecraft' on macOS and Linux.",
      version: "Version",
      versionHelper:
        "The folder name in the 'versions' folder in your game directory.",
      unopened: "Open a profile on the left or create a new profile.",
      removeConfirmation: (name: string) =>
        `Do you really want to remove profile ${name}?`,
    },
    settings: {
      general: "General",
      appearance: "Appearance",
      download: "Download",
      about: "About",
      noOptions: "No Options",
      displayLanguage: "Display Language",
      warning:
        "Nightly versions are extremely unstable.\nGo to GitHub Issues to ask questions or make suggestions.",
      tauriVersion: "Tauri Version",
      dataDir: "Data Directory",
      officialSite: "Official Website",
      githubHomepage: "GitHub Homepage",
      oss: "Open Source Software",
    },
  },
};
