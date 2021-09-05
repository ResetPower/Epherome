import { Language } from ".";

const jaJp: Language = {
  name: "ja-jp",
  nativeName: "日本語",
  definition: {
    hello: "こんにちは！",
    epherome: "Epherome",
    accounts: "アカウント",
    profiles: "プロフィル",
    settings: "設定",
    launch: "起動",
    launching: "起動中",
    edit: "編集",
    news: "お知らせ",
    create: "作成",
    cancel: "取り消し",
    remove: "削除",
    fine: "はい",
    email: "Eメール",
    password: "パスワード",
    username: "ユーザー名",
    authserver: "認証サーバー",
    name: "名前",
    directory: "パス",
    version: "バージョン",
    general: "一般",
    appearance: "外観",
    about: "について",
    os: "システム",
    language: "言語",
    save: "セーブ",
    warning: "警告",
    done: "完了",
    add: "追加",
    tip: "チップ",
    help: "ヘルプ",
    refresh: "リフレッシュ",
    collapse: "片付け",
    expand: "展開する",
    useDefault: "<ディフォルト>",
    haveNot: "ありません",
    export: "エクスポート",
    "account.mojang": "Mojang",
    "account.microsoft": "Microsoft",
    "account.authlib": "Authlib Injector",
    "account.offline": "オフライン",
    "account.errCreating":
      "情報が間違っているか、認証サーバーがダウンしています。",
    "account.removing": "アカウントを削除",
    "account.notSelected": "アカウントが選択されていません",
    "account.wrongPassword": "間違ったパスワード",
    "account.inputPassword": "パスワードを入力してください",
    "account.msAccNoMinecraft":
      "Microsoft アカウントには Minecraft がありません",
    "account.clickToLogin":
      "「作成」をクリックして、Microsoft アカウントにログインします。",
    "account.skin": "スキン",
    "account.skin.notSupportedExcludeMojangMs":
      "Mojang アカウントまたは Microsoft アカウントのスキンの表示のみをサポート。",
    "profile.removing": "プロフィルを削除",
    "profile.notSelected": "プロフィルが選択だれていません",
    "profile.openDirectory": "ブラウズ",
    "profile.usuallyDotMinecraftEtc":
      "通常、Windows では「.minecraft」、macOS および Linux では「minecraft」です。",
    "profile.maps": "マップ",
    "profile.resourcePacks": "リソースパック",
    "profile.resolution": "解像度",
    "profile.jvmArgs": "JVM 引数",
    "profile.noContent": "内容がありません",
    "profile.disable": "無効にする",
    "profile.enable": "有効にする",
    "profile.import": "インポート",
    "profile.gameDirIsolation": "ゲームパスの分離",
    "profile.showEpherome": "Epherome を表示",
    "profile.gameDirIsolation.description":
      "ゲームのバージョンが異なれば、異なるゲームパスを使用する。",
    "profile.showEpherome.description":
      "Minecraftホームページの左下隅に「Epherome」を表示します。",
    "profile.install": "インストール",
    "profile.installing": "インストール中",
    "profile.installForMinecraft": "Minecraft {0} にインストール",
    "profile.selectInstallContent": "インストールするものを選択してください。",
    "profile.installerAdaptToSomething": "Minecraft {0} の {1}",
    "profile.noInstallerAdaptToSomething":
      "Minecraft {0} の {1} が見つかりません",
    "profile.canOnlyInstallOnVanilla":
      "「インストール」は Minecraft のバニラバージョンのみをサポートしています。",
    "settings.epheromePath": "Epherome パス",
    "settings.officialSite": "公式サイト",
    "settings.openSourceSoftware": "オープンソースソフトウェア",
    "settings.downloadProvider": "ダウンロードソース",
    "settings.downloadProvider.official": "公式",
    "settings.downloadConcurrency": "ダウンロード並行数",
    "settings.hitokoto": "一言",
    "settings.hitokoto.description":
      "Epherome が提供するランダムなテキストをホームページに表示します。",
    "settings.theme": "テーマ",
    "settings.theme.followOS": "システムをフォロー",
    "settings.titleBar": "タイトルバー",
    "settings.titleBar.message":
      "Epherome を再起動して、タイトルバーの設定を適用します。",
    "settings.devMode": "デベロッパーモード",
    "settings.downloadProvider.description":
      "公式ソースが遅い場合は、それを置き換えることを試みることができます。",
    "settings.downloadCurrency.description":
      "同時にダウンロードできるファイルの数。",
    "java.executablePath": "Java 実行可能ファイルパス",
    "java.manage": "Java を管理",
    "java.invalidPath": "間違ったパス",
    "java.duplicatePath": "重複するパス",
    "java.detect": "検出する",
    "java.bitNumber": "{0} ビット",
    "java.default": "デフォルト Java",
    download: "ダウンロード",
    downloading: "ダウンロード中",
    downloadingSomething: "{0} をダウンロード中",
    "download.profileName": "プロフィル名前",
    "download.preparing": "準備中",
    "download.notSelected": "バージョンが選択だれていません",
    "version.release": "リリース",
    "version.snapshot": "スナップショット",
    "version.old": "古い",
    "version.old_alpha": "古い Alpha",
    "version.old_beta": "古い Beta",
    processes: "プロセス",
    "processes.noMinecraft": "Minecraft プロセスはありません",
    "processes.logExported": "ログは\n{0}\nにエクスポートされました。",
    "processes.terminate": "強制終了",
    "processes.terminateIrreversible":
      "プロセスを強制的に終了すると、いくつかの重要なデータが失われる可能性があります。続行しますか？",
    "processes.lookupLog": "ログを見る",
    "processes.exportLog": "ログをエクスポート",
    "processes.lookupProfile": "プロフィルを見る",
    "processes.notSelected": "プロセスが選択されていません",
    extensions: "拡張",
    epheromeUpdate: "Epherome 更新",
    "epheromeUpdate.check": "更新を確認する",
    "epheromeUpdate.available": "新しいバージョン {0} が利用可能です。",
    "epheromeUpdate.availableMessage":
      "Epherome の公式ウェブサイトにアクセスして最新バージョンをダウンロードしてください。",
    "epheromeUpdate.needNot": "Epherome は最新バージョンです。",
    "launching.noAccOrProSelected":
      "アカウントまたはプロフィルを選択されていません",
    "launching.considerUsingJava16":
      "1.17 以降、Minecraft を起動するには Java 16 が必要です。",
    "launching.considerUsingJava8":
      "1.6 より前に Minecraft を起動するには Java 8 が必要です。",
    "launching.javaNotFound": "Java が見つかりません",
    "launching.javaNotFoundMessage":
      "コンピュータにJavaが見つかりません。 インストールして、設定で追加してください。",
    "launching.downloadingAsset": "リソースをダウンロードしています",
    "launching.downloadingLib": "ライブラリをダウンロードしています",
    "launching.crashReport": "Minecraft がクラッシュしました！",
    "launching.crashReport.helper":
      "詳細については、「プロセス管理」ページを参照してください。",
    "ext.apps": "アプリ",
    internetNotAvailable:
      "Web はあなたにとって異なる、インターネットに接続できません。",
    errorOccurred: "エラーが発生しました",
    notSupportedYet: "すみません、これはさポードされていません。",
    confirmRemoving: "削除してもよろしいですか？操作は元に戻せません。",
    continueAnyway: "とにかく続け",
    moveToTrash: "ゴミ箱に移動",
    confirmMoveSomethingToTrash:
      "{0} をゴミ箱に移動してもよろしいですか？操作は元に戻せません。",
    exportedAt: "ここにエクスポートされました：",
    versionOfSomething: "{0} バージョン",
    doneMessage: "タスクは完了しました。",
    minimize: "最小化",
    quit: "終了",
    confirmQuitting: "Epherome を終了してもよろしいですか？",
  },
};

export default jaJp;
