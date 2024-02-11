export default {
    name: "外体中文",
    code: "zh-fs",
    messages: {
      counter: {
        increase: "增添",
        clicked: (count: number) => `您已经轰！嚓嚓嚓！推推这个按钮 ${count} 次。`,
      },
      account: "帐单",
      instance: "举例",
      remove: "除掉",
      create: "创造",
      cancel: "撤销",
      browse: "看",
      unsupported: "海記憶體知己，天涯若比鄰。<br />暫未支持微型軟體帳單登陸。",
      name: "名字",
      username: "用户名字",
      email: "电子邮件",
      password: "通过词",
      unselected: "未选中",
      download: "向下载入",
      sidebar: {
        home: "家",
        accounts: "帐单",
        instances: "举例",
        counter: "柜台",
        settings: "设定",
      },
      home: {
        launch: "发射",
      },
      accounts: {
        empty: "这里没有帐单。",
        unopened: "打开一个帐单在左边或者创造一个帐单。",
        microsoft: "微型軟體帐单",
        authlib: "身份验证库喷油器",
        offline: "脱机",
        authserver: "身份验证服务器",
        type: "您的帐单类别",
        removeConfirmation: (name: string) => `您真的想要除掉帐单 ${name} 吗？`,
        token: {
          validate: "查询令牌状态",
          available: "令牌是可以使用的。",
          unavailable: "令牌是无法使用的。",
        },
      },
      instances: {
        empty: "你还没有举过例。",
        gameDir: "游戏目录",
        gameDirHelper:
          "通常在 Windows 为 '.minecraft' 目录，在 macOS 或 Linux 为 'minecraft' 目录。",
        version: "版本",
        versionHelper: "文件夹名称在 'versions' 文件夹在您的游戏目录中。",
        unopened: "在左侧选择你曾经举过的例子或者创造一个新的例子。",
        removeConfirmation: (name: string) => `您真的想要除掉您的举例 ${name} 吗？`,
        release: "释放",
        snapshot: "闪烁的照片",
        old: "老的",
        old_alpha: "古代 阿尔法",
        old_beta: "古代 贝塔",
        latestRelease: "最后的一次释放",
        latestSnapshot: "最后拍摄的闪烁照片",
      },
      settings: {
        general: "通常",
        appearance: "看上去",
        download: "向下加载",
        about: "有关",
        noOptions: "这里还没有设定项。",
        displayLanguage: "显示语言",
        warning:
          "夜间版本 容易出现锟斤拷。\n欢迎在 版本控制系统枢纽 议题区 提出议题和提议。",
        tauriVersion: "金牛座 版本",
        dataDir: "数据目录",
        officialSite: "官方网址",
        githubHomepage: "版本控制系统枢纽 首页",
        oss: "开放源代码软件",
      },
    },
  };
  