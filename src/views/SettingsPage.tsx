import {
  Select,
  Checkbox,
  Link,
  Button,
  TextField,
  IconButton,
} from "../components/inputs";
import {
  configFilename,
  configStore,
  minecraftDownloadPath,
  setConfig,
} from "../struct/config";
import { logger } from "../renderer/global";
import { Card } from "../components/layouts";
import EpheromeLogo from "../../assets/Epherome.png";
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
import { showOverlay } from "../renderer/overlays";
import { DefaultFn } from "../tools";
import { FaJava } from "react-icons/fa";
import Dialog from "../components/Dialog";
import { List, ListItem, ListItemText } from "../components/lists";
import {
  checkJavaVersion,
  createJava,
  detectJava,
  removeJava,
} from "../struct/java";
import { useState } from "react";
import { t, intlStore } from "../intl";
import { _ } from "../tools/arrays";
import os from "os";
import { observer } from "mobx-react";
import { historyStore } from "../renderer/history";
import { useReducer } from "react";
import { MinecraftDownloadProvider } from "../craft/url";

export function UpdateAvailableDialog(props: {
  version: string;
  onClose: DefaultFn;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <p className="text-xl font-semibold">{t("epheromeUpdate")}</p>
      <p>{t("epheromeUpdate.available", props.version)}</p>
      <p>{t("epheromeUpdate.availableMessage")}</p>
      <Link type="url" href="https://epherome.com/download">
        https://epherome.com/download
      </Link>
      <div className="flex justify-end">
        <Button className="text-secondary" onClick={props.onClose}>
          {t("fine")}
        </Button>
      </div>
    </Dialog>
  );
}

export const JavaManagementDialog = observer((props: { close: DefaultFn }) => {
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
              className="text-secondary p-1 cursor-pointer mr-1 rounded-full bg-opacity-0 bg-yellow-300 hover:bg-opacity-20 active:bg-opacity-40 transition-colors"
              onClick={() => !value.selected && _.select(javas, value)}
            >
              {value.selected ? (
                <MdRadioButtonChecked />
              ) : (
                <MdRadioButtonUnchecked />
              )}
            </div>
            <ListItemText
              primary={
                value.name +
                " (" +
                t("java.bitNumber", value.is64Bit ? "64" : "32") +
                ") "
              }
              secondary={value.dir}
              longSecondary
            />
            <div className="flex-grow" />
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
        <Button className="text-secondary" onClick={props.close}>
          {t("done")}
        </Button>
      </div>
    </Dialog>
  );
});

const SettingsPage = observer(() => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [result, setResult] = useState<string | null>("");

  const handleUpdateCheck = () => {
    setResult(null);
    checkEphUpdate().then((result) => {
      if (result) {
        if (result.need) {
          setResult(t("epheromeUpdate.available", result.name));
          showOverlay((close) => (
            <UpdateAvailableDialog version={result.name} onClose={close} />
          ));
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
    forceUpdate();
  };
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
  const handleManageJava = () => {
    showOverlay((close) => <JavaManagementDialog close={close} />);
  };

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
          <TextField
            min={1}
            max={10}
            value={configStore.downloadConcurrency.toString()}
            type="number"
            label={t("settings.downloadConcurrency")}
            fieldClassName="w-32"
            onChange={(concurrency) => {
              const value = +concurrency;
              value > 0 &&
                value < 11 &&
                setConfig((cfg) => (cfg.downloadConcurrency = value));
            }}
          />
          <Select
            label="Java"
            value={_.selectedIndex(configStore.javas)?.toString() ?? ""}
            onChange={(value) =>
              setConfig((cfg) => _.select(cfg.javas, cfg.javas[+value]))
            }
          >
            {configStore.javas.map((value, index) => (
              <option value={index} key={index}>
                {value.name}
              </option>
            ))}
          </Select>
          <Button onClick={handleManageJava}>
            <FaJava /> {t("java.manage")}
          </Button>
          <Checkbox
            checked={configStore.hitokoto}
            onChange={(checked) => setConfig((cfg) => (cfg.hitokoto = checked))}
          >
            {t("settings.hitokoto")}
          </Checkbox>
          <p className="text-shallow">{t("settings.hitokoto.description")}</p>
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
        <div className="space-y-3">
          <Card className="flex items-center space-x-3">
            <img
              src={EpheromeLogo}
              alt="EpheromeLogo"
              className="w-16 h-16 pointer-events-none"
            />
            <div>
              <p className="font-semibold text-xl">Epherome Beta</p>
              <p>
                {t("version")} {ephVersion}
              </p>
            </div>
          </Card>
          <Card>
            <div>
              <p>
                {t("os")}: {os.platform()} {os.arch()} {os.release()}
              </p>
            </div>
            <div>
              <p>Electron: {process.versions.electron}</p>
              <p>Chrome: {process.versions.chrome}</p>
              <p>Node.js: {process.versions.node}</p>
              <p>V8: {process.versions.v8}</p>
            </div>
            <div>
              <p>{t("settings.configFilePath")}:</p>
              <Link href={configFilename} type="file">
                {configFilename}
              </Link>
              <p>{t("settings.minecraftDownloadPath")}:</p>
              <Link href={minecraftDownloadPath} type="file">
                {minecraftDownloadPath}
              </Link>
            </div>
          </Card>
          <Card>
            <p>
              {t("settings.officialSite")}:{" "}
              <Link href="https://epherome.com">https://epherome.com</Link>
            </p>
            <p>
              GitHub:{" "}
              <Link href="https://github.com/ResetPower/Epherome">
                https://github.com/ResetPower/Epherome
              </Link>
            </p>
            <p>Copyright © 2021 ResetPower.</p>
            <p>
              {t("settings.openSourceSoftware")} | GNU General Public License
              3.0
            </p>
          </Card>
        </div>
      </TabBody>
    </TabController>
  );
});

export default SettingsPage;
