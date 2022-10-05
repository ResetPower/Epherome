import {
  Select,
  Checkbox,
  Hyperlink,
  Button,
  TextField,
  IconButton,
  TinyTextField,
  TabBar,
  TabBarItem,
  TabBody,
  TabController,
  Spinner,
  List,
  ListItem,
  Info,
  WithHelper,
  rcsLight,
  rcsDark,
} from "@resetpower/rcs";
import {
  configStore,
  FnBoardPlacement,
  setConfig,
  TitleBarStyle,
} from "../../common/struct/config";
import { rendererLogger } from "common/loggers";
import { Card } from "../components/layouts";
import {
  MdAdd,
  MdClose,
  MdDoneOutline,
  MdDownload,
  MdEdit,
  MdFolderOpen,
  MdInfo,
  MdPalette,
  MdRemoveCircle,
  MdTune,
} from "react-icons/md";
import { checkEphUpdate } from "../renderer/updater";
import { FaJava } from "react-icons/fa";
import { createJava, removeJava } from "common/struct/java";
import { useState } from "react";
import { t, intlStore } from "../intl";
import { _ } from "common/utils/arrays";
import os from "os";
import { observer } from "mobx-react-lite";
import { MinecraftDownloadProvider } from "core/url";
import EpheromeLogo from "assets/Epherome.png";
import { ipcRenderer } from "electron";
import {
  codeName,
  ephDefaultDotMinecraft,
  ephVersion,
  userDataPath,
} from "common/utils/info";
import { overlayStore, showOverlay } from "eph/overlay";
import { historyStore } from "eph/renderer/history";
import { adapt, apply } from "common/utils";
import { openInBrowser, openInFinder } from "common/utils/open";
import { updateTheme } from "..";
import NewThemeView from "./NewThemeView";
import RadioButton from "eph/components/RadioButton";

export function UpdateAvailableDialog(props: { version: string }): JSX.Element {
  const href = "https://epherome.com/downloads";

  return (
    <>
      <p>{t("epheromeUpdate.available", props.version)}</p>
      <p>{t("epheromeUpdate.availableMessage")}</p>
      <Hyperlink onClick={() => openInBrowser(href)}>{href}</Hyperlink>
    </>
  );
}

export const JavaManagementSheet = observer(() => {
  const [editing, setEditing] = useState("");
  const [nickname, setNickname] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [newJavaPath, setNewJavaPath] = useState("");
  const javas = configStore.javas;

  const checkDuplicate = (dir: string) => {
    if (dir === "") {
      setErr(t("java.invalidPath"));
      return false;
    }
    for (const i of javas) {
      if (i.dir === dir) {
        setErr(t("java.duplicatePath"));
        return true;
      }
    }
    return false;
  };
  const handleAddJava = (value?: string, save = true) => {
    try {
      const val = window.native.findJavaExecutable(value ?? newJavaPath);
      if (checkDuplicate(val)) return;
      const java = window.native.checkJava(val);
      if (java) {
        createJava(java, save);
        setNewJavaPath("");
      } else setErr(t("java.invalidPath"));
    } catch {
      setErr(t("java.invalidPath"));
    }
  };
  const submitNickname = () => {
    setConfig((cfg) =>
      apply(
        cfg.javas.find((v) => v.nanoid === editing),
        (j) => (j.nickname = nickname ? nickname : undefined)
      )
    );
    setEditing("");
    setNickname("");
  };

  return (
    <div className="flex flex-col overflow-hidden px-9 m-1">
      <List className="overflow-y-auto flex-grow">
        {javas.map((value, index) => (
          <div className="flex items-center space-x-2" key={index}>
            <RadioButton
              active={_.selected(javas) === value}
              onClick={() => setConfig(() => _.select(javas, value))}
            />
            <div className="flex flex-col flex-grow w-3/4">
              <div className="flex">
                {editing === value.nanoid ? (
                  <div className="flex flex-grow">
                    <TinyTextField
                      value={nickname}
                      onEnter={submitNickname}
                      onChange={setNickname}
                      placeholder={t("java.nickName")}
                    />
                  </div>
                ) : (
                  value.nickname && (
                    <p className="flex-grow">{value.nickname}</p>
                  )
                )}
                <p className={value.nickname && "text-shallow"}>
                  {value.name +
                    " (" +
                    t("java.bitNumber", value.is64Bit ? "64" : "32") +
                    ") "}
                </p>
              </div>
              <p className="text-shallow text-sm overflow-ellipsis break-all">
                {value.dir}
              </p>
            </div>
            {editing === value.nanoid ? (
              <IconButton onClick={submitNickname}>
                <MdDoneOutline />
              </IconButton>
            ) : (
              <IconButton
                onClick={() => {
                  setEditing(value.nanoid);
                  if (value.nickname) {
                    setNickname(value.nickname);
                  }
                }}
              >
                <MdEdit />
              </IconButton>
            )}
            <IconButton onClick={() => removeJava(value)}>
              <MdClose />
            </IconButton>
          </div>
        ))}
      </List>
      <div className="mt-3">
        <TextField
          value={newJavaPath}
          onChange={(ev) => {
            setNewJavaPath(ev);
            setErr("");
          }}
          error={!!err}
          helperText={err ?? undefined}
          icon={<FaJava />}
          placeholder={t("java.executablePath")}
          trailing={
            <>
              <Hyperlink
                button
                className="border-r border-divider pr-3"
                onClick={() =>
                  ipcRenderer.invoke("open-java").then((value) => {
                    value && handleAddJava(value);
                  })
                }
              >
                <MdFolderOpen />
              </Hyperlink>
              <Hyperlink button className="pl-3" onClick={handleAddJava}>
                {t("add")}
              </Hyperlink>
            </>
          }
        />
        <div className="flex">
          <Button
            onClick={() => {
              try {
                window.native
                  .findJavas()
                  .forEach((i) => handleAddJava(i, false));
                configStore.save();
              } catch {
                setErr(t("java.invalidPath"));
              }
            }}
          >
            {t("java.detect")}
          </Button>
          <div className="flex-grow" />
          <Button
            onClick={() => {
              historyStore.push("java.installJava");
              overlayStore.close();
            }}
          >
            {t("java.installJava")}
          </Button>
        </div>
      </div>
    </div>
  );
});

export const SettingsGeneralFragment = observer(() => {
  const [result, setResult] = useState<string | null>("");

  const handleUpdateCheck = () => {
    setResult(null);
    checkEphUpdate().then((result) => {
      if (result) {
        if (result.need) {
          setResult(t("epheromeUpdate.available", result.name));
          showOverlay({
            title: t("epheromeUpdate"),
            content: UpdateAvailableDialog,
            params: {
              version: result.name,
            },
          });
        } else {
          setResult(t("epheromeUpdate.needNot"));
        }
      } else {
        setResult(t("internetNotAvailable"));
      }
    });
  };
  const handleChangeLanguage = (ev: string) => {
    rendererLogger.info(`Changing language to ${ev}'`);
    intlStore.setLanguage(ev);
    setResult("");
  };
  const handleManageJava = () => {
    showOverlay({
      type: "sheet",
      title: t("java.manage"),
      content: JavaManagementSheet,
    });
  };

  return (
    <div className="space-y-2">
      <Select
        value={intlStore.language?.name ?? ""}
        label={t("language")}
        onChange={handleChangeLanguage}
        options={intlStore.languages.map((lang) => ({
          value: lang.name,
          text: lang.nativeName,
          className: `eph-force-${lang.name}`,
        }))}
      />
      <Button onClick={handleManageJava}>
        <FaJava /> {t("java.manage")}
      </Button>
      <Checkbox
        checked={configStore.developerMode}
        onChange={(checked) =>
          setConfig((cfg) => (cfg.developerMode = checked))
        }
      >
        {t("settings.devMode")}
      </Checkbox>
      <div>
        <Checkbox
          checked={configStore.news}
          onChange={(checked) => setConfig((cfg) => (cfg.news = checked))}
        >
          {t("settings.showNews")}
        </Checkbox>
        <TextField
          label="News Title Amount"
          type="number"
          value={configStore.newsTitleAmount.toString()}
          onChange={(value) =>
            setConfig((cfg) => (cfg.newsTitleAmount = parseInt(value)))
          }
          min={2}
          max={20}
          helperText="How many news titles are there on your home page? Accepted values are from 2 to 20."
        />
        <div className="text-sm text-shallow">
          {intlStore.language?.name === "zh-cn" ? (
            <p>
              来自{" "}
              <Hyperlink onClick={() => openInBrowser("https://www.mcbbs.net")}>
                MCBBS
              </Hyperlink>
            </p>
          ) : intlStore.language?.name === "ja-jp" ? (
            <p>
              出典{" "}
              <Hyperlink onClick={() => openInBrowser("https://www.mcbbs.net")}>
                MCBBS
              </Hyperlink>
            </p>
          ) : (
            <p>
              From{" "}
              <Hyperlink onClick={() => openInBrowser("https://www.mcbbs.net")}>
                MCBBS
              </Hyperlink>
            </p>
          )}
        </div>
      </div>
      <Checkbox
        checked={configStore.checkUpdate}
        onChange={(checked) => setConfig((cfg) => (cfg.checkUpdate = checked))}
      >
        {t("settings.autoCheckUpdate")}
      </Checkbox>

      <div className="flex my-3 items-center space-x-3">
        <Button
          variant="contained"
          onClick={handleUpdateCheck}
          disabled={result === null}
        >
          {t("epheromeUpdate.check")}
        </Button>
        <p>{result !== null ? result : <Spinner />}</p>
      </div>
    </div>
  );
});

export const SettingsDisplayFragment = observer(() => {
  return (
    <div className="space-y-2">
      <p className="text-xl font-semibold">{t("settings.hitokoto")}</p>
      <div className="flex">
        <RadioButton
          active={configStore.hitokoto === false}
          onClick={() => setConfig((cfg) => (cfg.hitokoto = false))}
        />
        Disable
      </div>
      <div className="flex">
        <RadioButton
          active={configStore.hitokoto === true}
          onClick={() => setConfig((cfg) => (cfg.hitokoto = true))}
        />
        {t("settings.hitokoto")}
      </div>
      <div className="text-sm text-shallow">
        {intlStore.language?.name === "zh-cn" ? (
          <p>
            在您的首页显示一条由{" "}
            <Hyperlink onClick={() => openInBrowser("https://hitokoto.cn")}>
              Hitokoto
            </Hyperlink>{" "}
            提供的随机文本 (中文简体)
          </p>
        ) : intlStore.language?.name === "ja-jp" ? (
          <p>
            <Hyperlink onClick={() => openInBrowser("https://hitokoto.cn")}>
              Hitokoto
            </Hyperlink>{" "}
            が提供するランダムなテキストをホームページに表示します。 (日本語)
          </p>
        ) : (
          <p>
            Display a random line of text provided by{" "}
            <Hyperlink onClick={() => openInBrowser("https://hitokoto.cn")}>
              Hitokoto
            </Hyperlink>{" "}
            on your homepage. (English)
          </p>
        )}
      </div>
      <div className="flex">
        <RadioButton
          active={configStore.hitokoto === "custom"}
          onClick={() => setConfig((cfg) => (cfg.hitokoto = "custom"))}
        />
        Custom
      </div>
      <div className="py-1">
        {configStore.customHitokotoList.map((value, index) => (
          <div className="flex py-1 space-x-1" key={index}>
            <TextField
              value={value.content}
              onChange={(v) => setConfig(() => (value.content = v))}
              className="flex-grow"
            />
            <TextField
              value={value.from}
              onChange={(v) => setConfig(() => (value.from = v))}
            />
            <IconButton
              onClick={() =>
                setConfig(
                  (cfg) =>
                    (cfg.customHitokotoList = cfg.customHitokotoList.filter(
                      (hk) => hk !== value
                    ))
                )
              }
              className="text-danger"
            >
              <MdRemoveCircle />
            </IconButton>
          </div>
        ))}
        <Button
          onClick={() =>
            setConfig((cfg) =>
              cfg.customHitokotoList.push({ content: "Content", from: "From" })
            )
          }
          className="w-full"
        >
          <MdAdd /> {t("add")}
        </Button>
      </div>
    </div>
  );
});

export const SettingsAppearanceFragment = observer(() => {
  const theme = configStore.theme;

  const handleChangeTheme = (ev: string) => {
    if (!configStore.themeFollowOs) {
      rendererLogger.info(`Changing theme to '${ev}'`);
      setConfig((cfg) => (cfg.theme = ev));
      updateTheme();
    }
  };
  const handleThemeFollowOs = (checked: boolean) => {
    rendererLogger.info(`Theme follow OS is ${checked ? "on" : "off"}`);
    setConfig((cfg) => (cfg.themeFollowOs = checked));
    updateTheme();
  };
  const handleChangeTitleBarStyle = (ev: string) => {
    if (ev !== configStore.titleBarStyle) {
      setConfig((cfg) => (cfg.titleBarStyle = ev as TitleBarStyle));
      showOverlay({ message: t("settings.titleBar.message") });
    }
  };
  const handleOpenBgPath = () => {
    ipcRenderer
      .invoke("open-image")
      .then((value) => setConfig((cfg) => (cfg.bgPath = value)));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="font-medium text-lg mb-3">Window</p>
        <Select
          className="mb-3"
          value={configStore.titleBarStyle}
          label={t("settings.titleBar")}
          options={[
            { value: "os", text: "OS" },
            { value: "eph", text: "Eph" },
          ]}
          onChange={handleChangeTitleBarStyle}
        />
        <WithHelper helper="Your window will be default size next time if you unchecked it.">
          <Checkbox
            checked={configStore.rememberWindowSize}
            onChange={(checked) =>
              setConfig((cfg) => (cfg.rememberWindowSize = checked))
            }
          >
            Remember Window Size
          </Checkbox>
        </WithHelper>
      </div>
      <div>
        <p className="font-medium text-lg mb-3">Background Photo</p>
        <Checkbox
          checked={configStore.enableBg}
          onChange={(checked) => setConfig((cfg) => (cfg.enableBg = checked))}
        >
          Enable Background Photo
        </Checkbox>
        {configStore.enableBg && (
          <div className="mt-3">
            <Select
              label="Function Board Placement"
              options={[
                {
                  value: "off",
                  text: "Off",
                },
                { value: "top", text: "Top" },
                { value: "right", text: "Right" },
              ]}
              value={configStore.fnBoardPlacement}
              onChange={(value) =>
                setConfig(
                  (cfg) => (cfg.fnBoardPlacement = value as FnBoardPlacement)
                )
              }
            />
            <TextField
              value={configStore.bgPath}
              onChange={(value) => setConfig((cfg) => (cfg.bgPath = value))}
              label="File Path"
              trailing={
                <Hyperlink button onClick={handleOpenBgPath}>
                  {t("profile.openDirectory")}
                </Hyperlink>
              }
            />
          </div>
        )}
      </div>
      <div>
        <p className="font-medium text-lg mb-3">{t("settings.theme")}</p>
        <Checkbox
          checked={configStore.themeFollowOs}
          onChange={handleThemeFollowOs}
        >
          {t("settings.theme.followOS")}
        </Checkbox>
        {[rcsLight, rcsDark, ...configStore.themeList].map((value, index) => (
          <div className="flex" key={index}>
            <ListItem
              className="flex-grow"
              active={theme === value.name}
              onClick={() => handleChangeTheme(value.name)}
            >
              {value.name}
            </ListItem>
            {!adapt(value, rcsLight, rcsDark) && (
              <IconButton
                onClick={() =>
                  showOverlay({
                    title: t("warning"),
                    message: t("confirmRemoving"),
                    cancellable: true,
                    action: () => {
                      setConfig(
                        (cfg) =>
                          (cfg.themeList = cfg.themeList.filter(
                            (t) => t !== value
                          ))
                      );
                    },
                  })
                }
              >
                <MdClose />
              </IconButton>
            )}
          </div>
        ))}
        <ListItem
          onClick={() =>
            showOverlay({
              type: "sheet",
              title: t("theme.newTheme"),
              content: NewThemeView,
            })
          }
        >
          <MdAdd /> {t("theme.create")}
        </ListItem>
      </div>
    </div>
  );
});

export const SettingsDownloadFragment = observer(() => {
  const handleOpenTarget = () =>
    ipcRenderer
      .invoke("open-directory")
      .then((value) => setConfig((cfg) => (cfg.downloadTarget = value)));
  const handleRestore = () =>
    setConfig((cfg) => (cfg.downloadTarget = ephDefaultDotMinecraft));

  return (
    <div className="space-y-3">
      <WithHelper helper={t("settings.downloadProvider.description")}>
        <Select
          value={configStore.downloadProvider}
          label={t("settings.downloadProvider")}
          options={[
            {
              value: "official",
              text: t("settings.downloadProvider.official"),
            },
            { value: "bmclapi", text: "BMCLAPI" },
            { value: "mcbbs", text: "MCBBS" },
          ]}
          onChange={(provider) =>
            setConfig(
              (cfg) =>
                (cfg.downloadProvider = provider as MinecraftDownloadProvider)
            )
          }
        />
      </WithHelper>
      <TextField
        min={1}
        max={10}
        value={configStore.downloadConcurrency.toString()}
        type="number"
        label={t("settings.downloadConcurrency")}
        helperText={t("settings.downloadCurrency.description")}
        fieldClassName="w-32"
        onChange={(concurrency) => {
          const value = +concurrency;
          value > 0 &&
            value < 11 &&
            setConfig((cfg) => (cfg.downloadConcurrency = value));
        }}
      />
      <WithHelper helper="The target minecraft (or .minecraft) folder of Minecraft installations.">
        <TextField
          label="Download Target"
          value={configStore.downloadTarget}
          onChange={(value) => setConfig((cfg) => (cfg.downloadTarget = value))}
          trailing={
            <div className="flex items-center">
              <Hyperlink button onClick={handleOpenTarget}>
                {t("profile.openDirectory")}
              </Hyperlink>
            </div>
          }
        />
        <Button variant="pill" onClick={handleRestore}>
          Restore Default
        </Button>
      </WithHelper>
    </div>
  );
});

export const SettingsAboutFragment = (): JSX.Element => (
  <div className="space-y-3">
    <Card className="flex items-center space-x-3">
      <img
        src={EpheromeLogo}
        alt="EpheromeLogo"
        className="w-16 h-16 select-none"
      />
      <div className="select-none">
        <p className="space-x-1 text-lg">
          <span className="font-medium">Epherome</span>
          <span>{codeName ?? ""}</span>
        </p>
        <p className="space-x-1 text-sm">
          <span>{t("version")}</span>
          <span>Beta {ephVersion}</span>
        </p>
      </div>
    </Card>
    <Card>
      <Info title={t("os")}>
        <div className="flex space-x-1">
          <p className="capitalize">{os.platform()}</p>
          <p>{os.arch()}</p>
          <p>{os.release()}</p>
        </div>
      </Info>
      <Info title={t("versionOfSomething", "Electron")}>
        {process.versions.electron}
      </Info>
      <Info title={t("versionOfSomething", "Chrome")}>
        {process.versions.chrome}
      </Info>
      <Info title={t("versionOfSomething", "Node.js")}>
        {process.versions.node}
      </Info>
      <Info title={t("versionOfSomething", "V8")}>{process.versions.v8}</Info>
      <Info title={t("settings.epheromePath")}>
        <Hyperlink onClick={() => openInFinder(userDataPath)}>
          {userDataPath}
        </Hyperlink>
      </Info>
    </Card>
    <Card>
      <p>
        {t("settings.officialSite")}
        <Hyperlink
          paddingX
          onClick={() => openInBrowser("https://epherome.com")}
        >
          https://epherome.com
        </Hyperlink>
      </p>
      <p>
        GitHub
        <Hyperlink
          paddingX
          onClick={() =>
            openInBrowser("https://github.com/ResetPower/Epherome")
          }
        >
          https://github.com/ResetPower/Epherome
        </Hyperlink>
      </p>
      <p>Copyright © 2021-2022 ResetPower.</p>
      <p>{t("settings.openSourceSoftware")} | GNU General Public License 3.0</p>
    </Card>
  </div>
);

const SettingsPage = observer(() => {
  // visit the key to update on it changes
  intlStore.language;

  return (
    <TabController className="eph-h-full" orientation="vertical">
      <TabBar>
        <TabBarItem value={0}>
          <MdTune />
          {t("general")}
        </TabBarItem>
        <TabBarItem value={1}>
          <MdTune />
          {t("display")}
        </TabBarItem>
        <TabBarItem value={2}>
          <MdPalette />
          {t("appearance")}
        </TabBarItem>
        <TabBarItem value={3}>
          <MdDownload />
          {t("download")}
        </TabBarItem>
        <TabBarItem value={4}>
          <MdInfo />
          {t("about")}
        </TabBarItem>
      </TabBar>
      <TabBody className="overflow-y-auto">
        <SettingsGeneralFragment />
        <SettingsDisplayFragment />
        <SettingsAppearanceFragment />
        <SettingsDownloadFragment />
        <SettingsAboutFragment />
      </TabBody>
    </TabController>
  );
});

export default SettingsPage;
