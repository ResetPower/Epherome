export default {
  name: "English",
  code: "en-ww",
  messages: {
    counter: {
      increase: "Increase",
      clicked: (count: number) =>
        `You've clicked the button for ${count} times.`,
    },
    launching: {
      preparing: "Preparing",
      waiting: "Waiting to Launch",
    },
    downloading: {
      lib: "Downloading Libraries",
      asset: "Downloading Assets",
      clientJar: "Downloading Client Jar",
      clientJson: "Downloading Client Json",
      minecraft: {
        success: (version: string) =>
          `Installed Minecraft ${version} successfully.`,
        failed: (version: string) => `Failed to install Minecraft ${version}.`,
      },
    },
    installs: {
      minecraft: (version: string) => `Install Minecraft ${version}`,
    },
    general: "General",
    account: "Account",
    instance: "Instance",
    remove: "Remove",
    create: "Create",
    cancel: "Cancel",
    browse: "Browse",
    unsupported: "It is not supported yet.",
    name: "Name",
    username: "Username",
    email: "Email",
    password: "Password",
    unselected: "Unselected",
    download: "Download",
    sidebar: {
      home: "Home",
      accounts: "Accounts",
      instances: "Instances",
      counter: "Counter",
      settings: "Settings",
      collapse: "Collapse",
    },
    home: {
      launch: "Launch",
    },
    accounts: {
      empty: "No accounts here.",
      uuid: "UUID",
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
    instances: {
      empty: "No instances here.",
      gameDir: "Game Directory",
      gameDirHelper:
        "Usually '.minecraft' on Windows and Linux or 'minecraft' on macOS.",
      version: "Version",
      versionHelper:
        "The folder name in the 'versions' folder in your game directory.",
      unopened: "Open an instance on the left or create a new instance.",
      removeConfirmation: (name: string) =>
        `Do you really want to remove instance ${name}?`,
      release: "Release",
      snapshot: "Snapshot",
      old: "Ancient",
      old_alpha: "Ancient (Alpha)",
      old_beta: "Ancient (Beta)",
      latestRelease: "Latest Release",
      latestSnapshot: "Latest Snapshot",
      backToVersionList: "Back to version list",
      saves: "Saves",
      resourcePacks: "Resource Packs",
      mods: "Mods",
      options: "Options",
    },
    settings: {
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
      downloadProvider: "Download Provider",
      oss: "Open Source Software",
    },
    toast: {
      copied: "Copied successfully.",
    },
  },
};
