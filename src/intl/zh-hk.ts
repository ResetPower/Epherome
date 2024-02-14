export default {
  name: "粵語",
  code: "zh-hk",
  messages: {
    counter: {
      increase: "增加",
      clicked: (count: number) => `你已經 click 咗呢個按鈕 ${count} 次。`,
    },
    account: "帳戶",
    instance: "實例",
    remove: "移除",
    create: "創建",
    cancel: "取消",
    browse: "瀏覽",
    unsupported: "請拭目以待。",
    name: "名稱",
    username: "用戶名",
    email: "電郵",
    password: "密碼",
    unselected: "未選定",
    download: "下載",
    sidebar: {
      home: "首頁",
      accounts: "帳戶",
      instances: "實例",
      counter: "計數器",
      settings: "設置",
    },
    home: {
      launch: "啟動",
    },
    accounts: {
      empty: "仲未有帳戶。",
      unopened: "喺左邊打開一個帳戶或者創建新帳戶。",
      microsoft: "微軟帳戶",
      authlib: "外置登錄",
      offline: "離線登錄",
      authserver: "驗證伺服器",
      type: "帳戶類型",
      removeConfirmation: (name: string) => `你真係想要移除帳戶 ${name} 嗎？`,
      token: {
        validate: "檢查 token 狀態",
        available: "token 可用",
        unavailable: "token 唔可用",
      },
    },
    instances: {
      empty: "仲未有實例。",
      gameDir: "遊戲文件夾",
      gameDirHelper:
        "通常喺 Windows 同 Linux 度係 '.minecraft' 文件夾，而喺 macOS 度係 'minecraft' 文件夾。",
      version: "版本",
      versionHelper: "遊戲文件夾中嘅 'versions' 文件夾中嘅文件夾名。",
      unopened: "喺左邊打開一個實例或者創建新實例。",
      removeConfirmation: (name: string) => `你真係想要移除實例 ${name} 嗎？`,
      release: "正式版",
      snapshot: "快照",
      old: "遠古版",
      old_alpha: "遠古版 (Alpha)",
      old_beta: "遠古版 (Beta)",
      latestRelease: "最新嘅正式版本",
      latestSnapshot: "最新嘅快照版本",
    },
    settings: {
      general: "一般",
      appearance: "外觀",
      download: "下載",
      about: "關於",
      noOptions: "仲未有設置項。",
      displayLanguage: "顯示語言",
      warning: "Nightly 版好唔穩定。\n歡迎喺 GitHub Issues 提出問題同建議。",
      tauriVersion: "Tauri 版本",
      dataDir: "數據文件夾",
      officialSite: "官方網站",
      githubHomepage: "GitHub 首頁",
      oss: "開源軟件",
    },
  },
};
