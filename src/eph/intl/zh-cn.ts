import { Language } from ".";

const zhCn: Language = {
  name: "zh-cn",
  nativeName: "中文简体",
  definition: {
    hello: "你好！",
    home: "主页",
    epherome: "Epherome",
    accounts: "账户",
    profiles: "配置",
    settings: "设定",
    launch: "启动",
    launching: "启动中",
    edit: "编辑",
    news: "新闻",
    create: "创建",
    cancel: "取消",
    remove: "移除",
    fine: "好",
    email: "邮箱",
    password: "密码",
    username: "用户名",
    authserver: "认证服务器",
    name: "名称",
    directory: "路径",
    version: "版本",
    general: "常规",
    appearance: "外观",
    about: "关于",
    os: "操作系统",
    language: "语言",
    save: "保存",
    warning: "警告",
    done: "完成",
    add: "添加",
    tip: "提示",
    help: "帮助",
    refresh: "刷新",
    collapse: "收起",
    expand: "展开",
    useDefault: "<默认>",
    haveNot: "无",
    export: "导出",
    "account.mojang": "Mojang 账户",
    "account.microsoft": "微软账户",
    "account.authlib": "Authlib Injector",
    "account.offline": "离线账户",
    "account.errCreating": "信息错误或认证服务器已宕机。",
    "account.removing": "移除账户",
    "account.notSelected": "未选择账户",
    "account.wrongPassword": "密码错误",
    "account.inputPassword": "请输入密码",
    "account.msAccNoMinecraft": "您的 Microsoft 账户中没有 Minecraft",
    "account.clickToLogin": "点击「创建」以登入您的微软账户。",
    "account.skin": "皮肤",
    "account.skin.notSupportedExcludeMojangMs":
      "仅支持查看 Mojang 或微软账户的皮肤。",
    "profile.removing": "移除配置",
    "profile.notSelected": "未选择游戏配置",
    "profile.openDirectory": "浏览",
    "profile.usuallyDotMinecraftEtc":
      "在 Windows 下通常是「.minecraft」，在 macOS 与 Linux 下通常是「minecraft」。",
    "profile.maps": "地图",
    "profile.resourcePacks": "资源包",
    "profile.resolution": "分辨率",
    "profile.jvmArgs": "JVM 参数",
    "profile.noContent": "无内容",
    "profile.disable": "禁用",
    "profile.enable": "启用",
    "profile.import": "导入",
    "profile.gameDirIsolation": "版本隔离",
    "profile.gameDirIsolation.description":
      "对于不同的版本，使用不同的游戏文件夹。",
    "profile.showEpherome": "展示 Epherome",
    "profile.showEpherome.description":
      "在 Minecraft 主页的左下角显示「Epherome」标识。",
    "profile.install": "安装",
    "profile.installing": "安装中",
    "profile.installForMinecraft": "为 Minecraft {0} 安装",
    "profile.selectInstallContent": "请选择你要安装的内容。",
    "profile.installerAdaptToSomething": "适用于 Minecraft {0} 的 {1}",
    "profile.noInstallerAdaptToSomething": "没有适用于 Minecraft {0} 的 {1}",
    "profile.canOnlyInstallOnVanilla": "「安装」只在 Minecraft 原版可用。",
    "profile.safeLog4j": "安全的 Log4J",
    "profile.safeLog4j.description":
      "启用 「formatMsgNoLookups」 以预防 Log4J 问题。",
    "profile.exportModpack": "导出整合包",
    "profile.gameOptionsPath": "游戏设定路径",
    "profile.resourceType.resourcePack": "资源包",
    "profile.resourceType.shaderPack": "光影包",
    "settings.epheromePath": "Epherome 路径",
    "settings.officialSite": "官方网站",
    "settings.openSourceSoftware": "开源软件",
    "settings.downloadProvider": "下载源",
    "settings.downloadProvider.official": "官方",
    "settings.downloadConcurrency": "下载并发数",
    "settings.hitokoto": "一言",
    "settings.languageHelper":"只有英语才被完全翻译。其他的翻译是由善良的志愿者提供的。",
    "settings.theme": "主题",
    "settings.theme.followOS": "跟随操作系统",
    "settings.titleBar": "标题栏",
    "settings.titleBar.message": "重新启动 Epherome 以应用标题栏设定。",
    "settings.devMode": "开发者模式",
    "settings.downloadProvider.description": "如果官方源缓慢，可以尝试更换。",
    "settings.downloadCurrency.description": "可同时下载的最大文件数量。",
    "settings.showNews": "显示新闻",
    "settings.autoCheckUpdate": "自动检查更新",
    display: "显示",
    "java.executablePath": "Java 可执行文件路径",
    "java.manage": "管理 Java",
    "java.invalidPath": "路径不可用",
    "java.duplicatePath": "路径重复",
    "java.detect": "自动检测",
    "java.bitNumber": "{0} 位",
    "java.default": "默认 Java",
    "java.installJava": "安装 Java",
    "java.pleaseGoTo": "要安装这种 JDK，请点击下面的链接。",
    "java.nickName": "JVM 名称",
    download: "下载",
    downloading: "下载中",
    downloadingSomething: "正在下载 {0}",
    "download.profileName": "配置名",
    "download.preparing": "准备中",
    "download.notSelected": "未选择版本",
    "version.release": "正式版",
    "version.snapshot": "快照版",
    "version.old": "远古版",
    "version.old_alpha": "远古版 (Alpha)",
    "version.old_beta": "远古版 (Beta)",
    processes: "进程",
    "processes.noMinecraft": "没有 Minecraft 进程",
    "processes.logExported": "日志已经导出于\n{0}",
    "processes.terminate": "强制结束",
    "processes.terminateIrreversible":
      "强制终止进程可能导致你丢失一些重要数据，是否继续？",
    "processes.lookupLog": "查看日志",
    "processes.exportLog": "导出日志",
    "processes.lookupProfile": "查看游戏配置",
    "processes.notSelected": "未选择进程",
    extensions: "扩展",
    epheromeUpdate: "Epherome 更新",
    "epheromeUpdate.check": "检查更新",
    "epheromeUpdate.available": "新版本 {0} 现在可用。",
    "epheromeUpdate.availableMessage": "请前往 Epherome 官方网站下载最新版本。",
    "epheromeUpdate.needNot": "Epherome 已是最新版本。",
    "launching.noAccOrProSelected": "账户或游戏配置未选择。",
    "launching.considerUsingJava17":
      "从 Minecraft 1.18 开始，启动 Minecraft 需要 Java 17",
    "launching.considerUsingJava16":
      "从 Minecraft 1.17 开始，启动 Minecraft 需要 Java 16",
    "launching.considerUsingJava8":
      "在 Minecraft 1.6 以前，启动 Minecraft 需要 Java 8",
    "launching.javaNotFound": "找不到 Java",
    "launching.javaNotFoundMessage":
      "在您的电脑上找不到 Java，请安装后在设置中添加。",
    "launching.downloadingAsset": "正在下载资源文件",
    "launching.downloadingLib": "正在下载库文件",
    "launching.crashReport": "Minecraft 崩溃了！",
    "launching.crashReport.helper": "欲知详情，请见进程管理页。",
    "ext.apps": "应用程序",
    "theme.create": "创建主题...",
    "theme.newTheme": "新主题",
    "theme.type": "类型",
    "theme.light": "浅色主题",
    "theme.dark": "深色主题",
    "theme.background": "背景色",
    "theme.secondary": "强调色",
    "theme.divider": "分割线色",
    "theme.contrast": "字体色",
    "theme.primary": "主色",
    "theme.shallow": "浅字色",
    "theme.card": "卡片色",
    "theme.danger": "警示色",
    "task.manager": "任务管理器",
    "task.noTasks": "没有运行中的任务",
    "modpack.import": "导入整合包",
    "modpack.filePath": "整合包文件路径 (*.zip)",
    "modpack.unzipping": "解压中",
    "modpack.installingMinecraft": "正在安装 Minecraft",
    "modpack.installingModLoader": "正在安装 Mod 加载器",
    "modpack.info": "整合包信息",
    "modpack.name": "整合包名称",
    "modpack.version": "整合包版本",
    "modpack.author": "整合包作者",
    "modpack.selectFiles": "选择文件",
    "modpack.export": "导出",
    "modpack.exporting": "导出中",
    next: "下一步",
    previous: "上一步",
    search: "搜索",
    internetNotAvailable: "Web 因你而不同，未能连接到互联网。",
    errorOccurred: "发生错误",
    notSupportedYet: "抱歉，该功能暂不支持。",
    confirmRemoving: "您确定要移除它吗？该操作不可逆。",
    continueAnyway: "仍然继续",
    moveToTrash: "移到废纸篓",
    confirmMoveSomethingToTrash: "您确定要将 {0} 移到废纸篓吗？该操作不可逆。",
    exportedAt: "已导出于此处：",
    versionOfSomething: "{0} 版本",
    doneMessage: "该任务已完成。",
    minimize: "最小化",
    quit: "退出",
    confirmQuitting: "你确定要退出 Epherome 吗？",
    removeFilesAsWell: "删除文件",
    unableToRefreshMsToken: "无法刷新微软账户令牌，请重新登录。",
    msLoginAgain: "重新登录",
    ephPersonalCenter: "个人中心",
    ephLogin: "登录",
    "ext.installed": "已安装",
    "ext.recommended": "推荐",
    "ext.all": "全部",
    "ext.noItems": "无项目",
    "ext.remove": "从 Epherome 移除",
    "ext.add": "添加到 Epherome",
    "ext.reloadRequired": "需要重新加载",
    "personal.loginTo": "登录 Epherome 账户",
    "personal.register": "注册",
    "personal.login": "登录",
    "personal.openPersonalCenter": "打开个人中心",
    "personal.changeAvatar": "更换头像",
    "personal.logout": "登出",
    "personal.notLoggedIn": "还未登录",
    imageTooBig: "文件大小应在 256KB 以下。",
    notSelected: "未选择",
    "ext.added": "已添加",
    "ext.removed": "已移除",
    checkTokenAvailability: "检查令牌可用性",
    "token.available.true": "令牌可用。",
    "token.available.false": "令牌不可用。",
    "profiles.dirUnavailable": "路径不可用。",
    "profiles.searchVersion": "检索",
    serverControl: "服务器控制",
    "server.removing": "移除服务器",
    marketplace: "资源广场",
    newsTitleAmount: "新闻标题数量",
    "newsTitleAmount.description":"主页上的新闻标题数量。可接受的取值范围是 {0}.",
    disabled: "禁用",
    showRefreshButton: "显示刷新按钮",
    custom: "自定义",
    "settings.allowNotificationDot": "允许通知的红点", 
  },
};

export default zhCn;
