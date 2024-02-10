export default {
  name: "English",
  code: "en-ww",
  messages: {
    counter: {
      increase: "Increase",
      clicked: (count: number) =>
        `You've clicked the button for ${count} times.`,
    },
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
    settings: {
      general: "General",
      appearance: "Appearance",
      download: "Download",
      about: "About",
      displayLanguage: "Display Language",
    },
  },
};
