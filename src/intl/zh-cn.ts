export default {
  name: "简体中文",
  code: "zh-cn",
  messages: {
    counter: {
      increase: "增加",
      clicked: (count: number) => 
        `你已经点击这个按钮 ${count} 次。`,
    },
    launching: {
      preparing: "准备中",
      waiting: "等待游戏启动中",
    },
    downloading: {
      lib: "正在下载游戏库",
      asset: "正在下载游戏资源",
      clientJar: "正在下载客户端 jar 文件",
      clientJson: "正在下载客户端 json 文件",
      minecraft: {
        success: (version: string) =>
          `Minecraft ${version} 安装成功。`,
        failed: (version: string) => `Minecraft ${version} 下载失败。`,
      },
    },
    installs: {
      minecraft: (version: string) => `正在安装 Minecraft ${version}`,
    },
    general: "常规",
    account: "账户",
    instance: "实例",
    remove: "移除",
    create: "创建",
    cancel: "取消",
    browse: "浏览",
    unsupported: "请拭目以待。",
    name: "名称",
    username: "用户名",
    email: "电子邮箱",
    password: "密码",
    unselected: "未选定",
    download: "下载",
    sidebar: {
      home: "首页",
      accounts: "账户",
      instances: "实例",
      counter: "计数器",
      settings: "设置",
      collapse: "收起",
    },
    home: {
      launch: "启动",
    },
    accounts: {
      empty: "还没有账户。",
      uuid: "UUID",
      unopened: "在左侧打开一个账户或者创建新账户。",
      microsoft: "微软账户",
      authlib: "外置登录",
      offline: "离线登录",
      authserver: "验证服务器",
      type: "账户类型",
      removeConfirmation: (name: string) =>
        `是否要移除账户 ${name} ？`,
      token: {
        validate: "检查令牌状态",
        available: "令牌可用",
        unavailable: "令牌不可用",
      },
    },
    instances: {
      empty: "还没有实例。",
      gameDir: "游戏文件夹",
      gameDirHelper:
        "通常是 Windows 上的 '.minecraft' 文件夹和 macOS 或 Linux 上的 'minecraft' 文件夹。",
      version: "版本",
      versionHelper: 
        "游戏文件夹中的 'versions' 文件夹中的文件夹名。",
      unopened: "在左侧打开一个实例或者创建新实例。",
      removeConfirmation: (name: string) => 
        `是否要移除实例 ${name} ？`,
      release: "正式版",
      snapshot: "快照",
      old: "远古版",
      old_alpha: "远古版 (Alpha)",
      old_beta: "远古版 (Beta)",
      latestRelease: "最新正式版",
      latestSnapshot: "最新快照",
      backToVersionList: "返回版本列表",
      saves: "存档",
      resourcePacks: "资源包",
      mods: "Mods",
      options: "选项",
    },
    settings: {
      appearance: "外观",
      download: "下载",
      about: "关于",
      noOptions: "还没有设置项。",
      displayLanguage: "显示语言",
      warning:
        "Nightly 版本极端不稳定。\n欢迎在 GitHub Issues 提出问题和建议。",
      tauriVersion: "Tauri 版本",
      dataDir: "数据文件夹",
      officialSite: "官方网站",
      githubHomepage: "GitHub 首页",
      downloadProvider: "下载源",
      oss: "开源软件",
    },
    toast: {
      copied: "已成功复制。",
    },
  },
};
