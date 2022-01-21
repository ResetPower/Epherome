import {
  Select,
  Checkbox,
  Link,
  Button,
  TextField,
  IconButton,
  TinyTextField,
  TabBar,
  TabBarItem,
  TabBody,
  TabController,
  Spin,
  List,
  ListItem,
  Info,
  WithHelper,
  rcsLight,
  rcsDark,
} from "@resetpower/rcs";
import {
  configStore,
  setConfig,
  TitleBarStyle,
} from "../../common/struct/config";
import { rendererLogger } from "common/loggers";
import { Card } from "../components/layouts";
import {
  MdAdd,
  MdClose,
  MdDoneOutline,
  MdEdit,
  MdFolderOpen,
  MdInfo,
  MdPalette,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
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
import { codeName, ephVersion, userDataPath } from "common/utils/info";
import { overlayStore, showOverlay } from "eph/overlay";
import { pushToHistory } from "eph/renderer/history";
import { adapt, apply } from "common/utils";
import { openInBrowser, openInFinder } from "common/utils/open";
import { updateTheme } from "..";
import NewThemeView from "./NewThemeView";

export function UpdateAvailableDialog(props: { version: string }): JSX.Element {
  const href = "https://epherome.com/download";

  return (
    <>
      <p>{t("epheromeUpdate.available", props.version)}</p>
      <p>{t("epheromeUpdate.availableMessage")}</p>
      <Link onClick={() => openInBrowser(href)}>{href}</Link>
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
          <ListItem className="items-center space-x-2" key={index}>
            <div
              className="text-pink-400 hover:text-pink-500 cursor-pointer"
              onClick={() => setConfig(() => _.select(javas, value))}
            >
              {_.selected(javas) === value ? (
                <MdRadioButtonChecked />
              ) : (
                <MdRadioButtonUnchecked />
              )}
            </div>
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
          </ListItem>
        ))}
      </List>
      <div>
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
              <Link
                className="border-r border-divider pr-3"
                onClick={() =>
                  ipcRenderer.invoke("open-java").then((value) => {
                    value && handleAddJava(value);
                  })
                }
              >
                <MdFolderOpen />
              </Link>
              <Link className="pl-3" onClick={handleAddJava}>
                {t("add")}
              </Link>
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
              pushToHistory("java.installJava");
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
        }))}
      />
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
      <WithHelper helper={t("settings.hitokoto.description")}>
        <Checkbox
          checked={configStore.hitokoto}
          onChange={(checked) => setConfig((cfg) => (cfg.hitokoto = checked))}
        >
          {t("settings.hitokoto")}
        </Checkbox>
      </WithHelper>
      <div className="flex my-3 items-center space-x-3">
        <Button
          variant="contained"
          onClick={handleUpdateCheck}
          disabled={result === null}
        >
          {t("epheromeUpdate.check")}
        </Button>
        <p>{result !== null ? result : <Spin />}</p>
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
    setConfig((cfg) => (cfg.titleBarStyle = ev as TitleBarStyle));
    showOverlay({ message: t("settings.titleBar.message") });
  };

  return (
    <div className="space-y-3">
      <div>
        <Select
          value={configStore.titleBarStyle}
          label={t("settings.titleBar")}
          options={[
            { value: "os", text: t("os") },
            { value: "eph", text: t("epherome") },
          ]}
          onChange={handleChangeTitleBarStyle}
        />
      </div>
      <div>
        <p className="font-semibold text-lg mb-3">{t("settings.theme")}</p>
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
              checked={theme === value.name}
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
              title: "New Theme",
              content: NewThemeView,
            })
          }
        >
          <MdAdd /> Create a theme...
        </ListItem>
      </div>
    </div>
  );
});

export const SettingsAboutFragment = (): JSX.Element => (
  <div className="space-y-3">
    <Card className="flex items-center space-x-3">
      <img src={EpheromeLogo} alt="EpheromeLogo" className="w-16 h-16" />
      <div>
        <p className="space-x-1 text-lg">
          <span className="font-semibold">Epherome</span>
          <span className="font-light">{codeName ?? ""}</span>
        </p>
        <p className="space-x-1 text-sm">
          <span>{t("version")}</span>
          <span>Beta {ephVersion}</span>
        </p>
      </div>
    </Card>
    <Card>
      <Info className="capitalize" title={t("os")}>
        {os.platform()} {os.arch()} {os.release()}
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
        <Link onClick={() => openInFinder(userDataPath)}>{userDataPath}</Link>
      </Info>
    </Card>
    <Card>
      <p>
        {t("settings.officialSite")}
        <Link paddingX onClick={() => openInBrowser("https://epherome.com")}>
          https://epherome.com
        </Link>
      </p>
      <p>
        GitHub
        <Link
          paddingX
          onClick={() =>
            openInBrowser("https://github.com/ResetPower/Epherome")
          }
        >
          https://github.com/ResetPower/Epherome
        </Link>
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
      <TabBar className="shadow-md">
        <TabBarItem value={0}>
          <MdTune />
          {t("general")}
        </TabBarItem>
        <TabBarItem value={1}>
          <MdPalette />
          {t("appearance")}
        </TabBarItem>
        <TabBarItem value={2}>
          <MdInfo />
          {t("about")}
        </TabBarItem>
      </TabBar>
      <TabBody className="overflow-y-auto">
        <SettingsGeneralFragment />
        <SettingsAppearanceFragment />
        <SettingsAboutFragment />
      </TabBody>
    </TabController>
  );
});

export default SettingsPage;
