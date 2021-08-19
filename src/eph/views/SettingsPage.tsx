import {
  Select,
  Checkbox,
  Link,
  Button,
  TextField,
  IconButton,
} from "../components/inputs";
import { configStore, setConfig, userDataPath } from "common/struct/config";
import { logger } from "../renderer/global";
import { Card } from "../components/layouts";
import {
  MdClose,
  MdInfo,
  MdPalette,
  MdRadioButtonChecked,
  MdRadioButtonUnchecked,
  MdTune,
} from "react-icons/md";
import { themeStore } from "../renderer/theme";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { checkEphUpdate, ephVersion } from "../renderer/updater";
import Spin from "../components/Spin";
import { showOverlay, useOverlayCloser } from "../renderer/overlays";
import { FaJava } from "react-icons/fa";
import Dialog from "../components/Dialog";
import { List, ListItem, ListItemText } from "../components/lists";
import { createJava, removeJava } from "common/struct/java";
import { useState } from "react";
import { t, intlStore } from "../intl";
import { _ } from "common/utils/arrays";
import os from "os";
import { observer } from "mobx-react";
import { historyStore } from "../renderer/history";
import { useReducer } from "react";
import { MinecraftDownloadProvider } from "core/down/url";
import { checkJavaVersion, detectJava } from "core/java";
import { Info, WithHelper } from "../components/fragments";
import { DefaultFn } from "common/utils";
import EpheromeLogo from "assets/Epherome.png";

export function UpdateAvailableDialog(props: { version: string }): JSX.Element {
  const close = useOverlayCloser();

  return (
    <Dialog indentBottom>
      <p className="text-xl font-semibold">{t("epheromeUpdate")}</p>
      <p>{t("epheromeUpdate.available", props.version)}</p>
      <p>{t("epheromeUpdate.availableMessage")}</p>
      <Link type="url" href="https://epherome.com/download">
        https://epherome.com/download
      </Link>
      <div className="flex justify-end">
        <Button className="text-secondary" onClick={close}>
          {t("fine")}
        </Button>
      </div>
    </Dialog>
  );
}

export const JavaManagementDialog = observer(() => {
  const close = useOverlayCloser();
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

  return (
    <Dialog
      className="eph-max-h-full flex flex-col overflow-hidden"
      indentBottom
    >
      <p className="font-semibold text-xl">{t("java.manage")}</p>
      <List className="overflow-y-auto">
        {javas.map((value, index) => (
          <ListItem className="items-center" key={index}>
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
            <ListItemText
              className="w-3/4"
              primary={
                value.name +
                " (" +
                t("java.bitNumber", value.is64Bit ? "64" : "32") +
                ") "
              }
              longSecondary
              secondary={value.dir}
              expand
            />
            <IconButton
              onClick={() => {
                removeJava(value);
              }}
            >
              <MdClose />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <TextField
        value={newJavaPath}
        onChange={(ev) => {
          setNewJavaPath(ev);
          setErr("");
        }}
        error={!!err}
        helperText={err ?? undefined}
        icon={<FaJava />}
        placeholder={t("java.newPath")}
        trailing={
          <Link
            type="clickable"
            onClick={() => {
              const val = newJavaPath;
              if (checkDuplicate(val)) return;
              setErr(null);
              checkJavaVersion(val).then((result) => {
                if (result) {
                  createJava(result);
                  setNewJavaPath("");
                } else setErr(t("java.invalidPath"));
              });
            }}
          >
            {t("add")}
          </Link>
        }
      />
      <div className="flex">
        <Button
          onClick={() =>
            detectJava().then((result) => {
              if (result) {
                if (checkDuplicate(result.dir)) return;
                createJava(result);
              }
            })
          }
        >
          {t("java.detect")}
        </Button>
        <div className="flex-grow" />
        <Button className="text-secondary" onClick={close}>
          {t("done")}
        </Button>
      </div>
    </Dialog>
  );
});

export const SettingsGeneralFragment = observer(
  (props: { forceUpdate: DefaultFn }) => {
    const [result, setResult] = useState<string | null>("");

    const handleUpdateCheck = () => {
      setResult(null);
      checkEphUpdate().then((result) => {
        if (result) {
          if (result.need) {
            setResult(t("epheromeUpdate.available", result.name));
            showOverlay(<UpdateAvailableDialog version={result.name} />);
          } else {
            setResult(t("epheromeUpdate.needNot"));
          }
        } else {
          setResult(t("internetNotAvailable"));
        }
      });
    };
    const handleChangeLanguage = (ev: string) => {
      logger.info(`Changing language to ${ev}'`);
      intlStore.setLanguage(ev);
      setConfig((cfg) => (cfg.language = ev));
      historyStore.dispatch(ev);
      setResult("");
      props.forceUpdate();
    };
    const handleManageJava = () => {
      showOverlay(<JavaManagementDialog />);
    };

    return (
      <div className="space-y-2">
        <Select
          value={intlStore.language?.name ?? ""}
          label={t("language")}
          onChange={handleChangeLanguage}
        >
          {intlStore.languages.map((lang, index) => (
            <option value={lang.name} key={index}>
              {lang.nativeName}
            </option>
          ))}
        </Select>
        <WithHelper helper={t("settings.downloadProvider.description")}>
          <Select
            value={configStore.downloadProvider}
            label={t("settings.downloadProvider")}
            onChange={(provider) =>
              setConfig(
                (cfg) =>
                  (cfg.downloadProvider = provider as MinecraftDownloadProvider)
              )
            }
          >
            <option value="official">
              {t("settings.downloadProvider.official")}
            </option>
            <option value="bmclapi">BMCLAPI</option>
            <option value="mcbbs">MCBBS</option>
          </Select>
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
  }
);

export const SettingsAppearanceFragment = observer(() => {
  const handleChangeTheme = (ev: string) => {
    logger.info(`Changing theme to '${ev}'`);
    setConfig((cfg) => (cfg.theme = ev));
    themeStore.updateTheme();
  };
  const handleThemeFollowOs = (checked: boolean) => {
    logger.info(`Theme follow OS is ${checked ? "on" : "off"}`);
    setConfig((cfg) => (cfg.themeFollowOs = checked));
    themeStore.updateTheme();
  };

  return (
    <div>
      <Select
        value={configStore.theme}
        label={t("settings.theme")}
        onChange={handleChangeTheme}
        disabled={configStore.themeFollowOs}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </Select>
      <Checkbox
        checked={configStore.themeFollowOs}
        onChange={handleThemeFollowOs}
      >
        {t("settings.theme.followOS")}
      </Checkbox>
    </div>
  );
});

export const SettingsAboutFragment = (): JSX.Element => (
  <div className="space-y-3">
    <Card className="flex items-center space-x-3">
      <img src={EpheromeLogo} alt="EpheromeLogo" className="w-16 h-16" />
      <div>
        <p className="font-semibold text-xl">Epherome Beta</p>
        <p>
          {t("version")} {ephVersion}
        </p>
      </div>
    </Card>
    <Card>
      <Info title={t("os")}>
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
        <Link href={userDataPath} type="folder">
          {userDataPath}
        </Link>
      </Info>
    </Card>
    <Card>
      <p>
        {t("settings.officialSite")}
        <Link paddingX href="https://epherome.com">
          https://epherome.com
        </Link>
      </p>
      <p>
        GitHub
        <Link paddingX href="https://github.com/ResetPower/Epherome">
          https://github.com/ResetPower/Epherome
        </Link>
      </p>
      <p>Copyright © 2021 ResetPower.</p>
      <p>{t("settings.openSourceSoftware")} | GNU General Public License 3.0</p>
    </Card>
  </div>
);

export default function SettingsPage(): JSX.Element {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

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
        <SettingsGeneralFragment forceUpdate={forceUpdate} />
        <SettingsAppearanceFragment />
        <SettingsAboutFragment />
      </TabBody>
    </TabController>
  );
}
