import { defineLanguage } from "./languages";

// Chinese (China Mainland, Simplified) Language Definition File
export default defineLanguage({
  name: "zh-cn",
  nativeName: "中文简体",
  translator: {
    hello: "你好！",
    epherome: "Epherome",
    settings: "设定",
    accounts: "账户",
    profiles: "档案",
    launch: "启动",
    edit: "编辑",
    news: "新闻",
    create: "创建",
    cancel: "取消",
    remove: "移除",
    newAccount: "新建账户",
    removeAccount: "移除账户",
    newProfile: "新建档案",
    removeProfile: "移除档案",
    editProfile: "编辑档案",
    mojang: "Mojang 账户",
    microsoft: "微软账户",
    authlib: "外置登录账户",
    offline: "离线账户",
    email: "邮箱",
    password: "密码",
    username: "用户名",
    authserver: "认证服务器",
    errCreatingAccount: "信息填写错误或认证服务器宕机。",
    confirmRemoving: "您确定要移除它吗？该操作不可逆。",
    name: "名称",
    directory: "目录",
    version: "版本",
    general: "常规",
    appearance: "外观",
    about: "关于",
    os: "操作系统",
    cfgFilePath: "配置文件路径",
    officialSite: "官方网站",
    oss: "开源软件",
    language: "语言",
    save: "保存",
    noAccountsYet: "还没有账户。点击「创建」来新建一个吧。",
    noProfilesYet: "还没有档案。点击「创建」来新建一个吧。",
    launching: "启动中",
    javaPath: "Java 路径",
    openDirectory: "打开文件夹",
    usuallyDotMinecraftEtc:
      "在 Windows 上通常是 '.minecraft' 而在 macOS 与 Linux 上通常是 'minecraft'",
    theme: "主题",
    ok: "好",
    passwordWrong: "密码错误",
    pleaseInputPassword: "请输入密码",
    errorOccurred: "发生了错误",
    manageXxx: "{} 管理",
    notSupportedYet: "抱歉，此功能尚不可用。",
    warning: "警告",
    alphaWarning: "程序处于内测阶段，请谨慎使用。",
    hitokoto: "一言",
    download: "下载",
    clickToLogin: "点击「创建」来登录您的微软账户",
    downloads: "下载",
    add: "添加",
    considerUsingJava16: "启动 Minecraft 1.17 需要使用 Java 16 或以上版本。",
    downloadingJson: "正在下载版本 json 文件",
    downloadingJar: "正在下载版本 jar 文件",
    javaNotFound: "Java 缺失",
    javaNotFoundMessage:
      "无法在您的电脑上找到 Java，请安装一个并在设置中添加。",
    manageJava: {
      newJavaPath: "新的 Java 路径",
      invalidJavaPath: "错误的 Java 路径",
      duplicateJavaPath: "重复的 Java 路径",
      detect: "自动检测",
    },
    progress: {
      auth: "登录",
      analyze: "解析 JSON",
      downloading: "下载缺失的库文件与资源文件",
      unzipping: "解压原生库",
      running: "运行中",
    },
    helper: {
      downloadingAsset: "下载资源文件",
      downloadingLib: "下载库文件",
    },
    release: "正式版",
    snapshot: "快照版",
    old: "远古版",
    cannotConnectToInternet: "Web 因你而不同，无法连接到互联网。",
    hitokotoDescription: "在您的首页显示一条由 Epherome 提供的随机一行文本。",
    msAccNoMinecraft: "您的微软账户尚未拥有 Minecraft",
    downloading: "正在下载",
    official: "官方",
    downloadProvider: "下载源",
    downloadProviderIsNotAble: "暂不支持更换下载源，请谅解。",
    downloadNotSupported: "很抱歉，目前暂不支持 Minecraft 客户端的下载。",
    maps: "地图",
    resourcePacks: "资源包",
    noAccOrProSelected: "未选择账户或档案。",
    followOs: "跟随操作系统",
    noAccSelected: "无账户",
    noProSelected: "无档案",
    refreshHitokoto: "刷新",
    processes: "进程管理",
    extensions: "扩展",
    minecraftDirPath: "Minecraft 下载文件夹",
    checkUpdate: "检查更新",
    youAreUsingTheLatestVersion: "Epherome 已是最新版本。",
    updateAvailable: "新版本 {} 现在可用。",
    epheromeUpdate: "Epherome 更新",
    pleaseGoToSiteToDownloadLatestVersion:
      "请前往 Epherome 官方网站下载最新版本",
    noMinecraftProcesses: "没有 Minecraft 进程",
    xxxBit: "{}位",
    done: "完成",
  },
});
