import {
  Select,
  Checkbox,
  Link,
  Button,
  TextField,
  IconButton,
} from "../components/inputs";
import {
  cfgPath,
  configStore,
  mcDownloadPath,
  setConfig,
} from "../struct/config";
import { logger } from "../renderer/global";
import { Typography, Card } from "../components/layouts";
import EpheromeLogo from "../../assets/Epherome.png";
import { MdClose, MdInfo, MdPalette, MdTune } from "react-icons/md";
import { themeStore } from "../renderer/theme";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { checkEphUpdate, ephVersion } from "../renderer/updater";
import Spin from "../components/Spin";
import { showDialog } from "../renderer/overlays";
import { DefaultFn, EmptyObject } from "../tools";
import { FaJava } from "react-icons/fa";
import Dialog from "../components/Dialog";
import { List, ListItem, ListItemText } from "../components/lists";
import {
  checkJavaVersion,
  createJava,
  detectJava,
  removeJava,
} from "../struct/java";
import { useState, useCallback, Component } from "react";
import { t, intlStore } from "../intl";
import { _ } from "../tools/arrays";
import os from "os";
import { Observer } from "mobx-react";
import { historyStore } from "../renderer/history";

export function UpdateAvailableDialog(props: {
  version: string;
  onClose: DefaultFn;
}): JSX.Element {
  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">
        {t("epheromeUpdate")}
      </Typography>
      <Typography>{t("updateAvailable", props.version)}</Typography>
      <Typography>{t("pleaseGoToSiteToDownloadLatestVersion")}</Typography>
      <Link type="url" href="https://epherome.com/download">
        https://epherome.com/download
      </Link>
      <div className="flex justify-end">
        <Button className="text-secondary" onClick={props.onClose}>
          {t("ok")}
        </Button>
      </div>
    </Dialog>
  );
}

export function JavaManagementDialog(props: {
  onClose: DefaultFn;
}): JSX.Element {
  const [err, setErr] = useState<string | null>(null);
  const [newJavaPath, setNewJavaPath] = useState("");
  const javas = configStore.javas;
  const checkDuplicate = useCallback(
    (dir: string) => {
      if (dir === "") {
        setErr(t("manageJava.invalidJavaPath"));
        return false;
      }
      for (const i of javas) {
        if (i.dir === dir) {
          setErr(t("manageJava.duplicateJavaPath"));
          return true;
        }
      }
      return false;
    },
    [javas]
  );

  return (
    <Observer>
      {() => (
        <Dialog
          className="eph-max-h-full flex flex-col overflow-hidden"
          indentBottom
        >
          <Typography className="font-semibold text-xl">
            {t("manageXxx", "Java")}
          </Typography>
          <List className="overflow-y-auto">
            {javas.map((value, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={
                    value.name +
                    " (" +
                    t("xxxBit", value.is64Bit ? "64" : "32") +
                    ") "
                  }
                  secondary={value.dir}
                  longSecondary
                />
                <div className="flex-grow" />
                <IconButton
                  onClick={() => {
                    removeJava(index);
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
            placeholder={t("manageJava.newJavaPath")}
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
                    } else setErr(t("manageJava.invalidJavaPath"));
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
              {t("manageJava.detect")}
            </Button>
            <div className="flex-grow" />
            <Button onClick={props.onClose}>{t("done")}</Button>
          </div>
        </Dialog>
      )}
    </Observer>
  );
}

export interface SettingsPageState {
  updateCheckResult: string | null;
}

export default class SettingsPage extends Component<
  EmptyObject,
  SettingsPageState
> {
  state: SettingsPageState = {
    updateCheckResult: "",
  };
  handleUpdateCheck = (): void => {
    this.setState({
      updateCheckResult: null,
    });
    checkEphUpdate().then((result) => {
      if (result) {
        if (result.need) {
          this.setState({
            updateCheckResult: t("updateAvailable", result.name),
          });
          showDialog((close) => (
            <UpdateAvailableDialog version={result.name} onClose={close} />
          ));
        } else {
          this.setState({
            updateCheckResult: t("youAreUsingTheLatestVersion"),
          });
        }
      } else {
        this.setState({ updateCheckResult: t("cannotConnectToInternet") });
      }
    });
  };
  handleChangeLanguage = (ev: string): void => {
    intlStore.setLanguage(ev);
    this.setState({ updateCheckResult: "" });
    setConfig((cfg) => (cfg.language = ev));
    historyStore.dispatch();
    logger.info(`Language changed to '${ev}'`);
  };
  handleChangeTheme = (ev: string): void => {
    setConfig((cfg) => (cfg.theme = ev));
    themeStore.updateTheme();
    logger.info(`Theme changed to '${ev}'`);
  };
  handleThemeFollowOs = (checked: boolean): void => {
    setConfig((cfg) => (cfg.themeFollowOs = checked));
    themeStore.updateTheme();
    logger.info(`Theme follow OS is ${checked ? "on" : "off"}`);
  };
  handleManageJava = (): void => {
    showDialog((close) => <JavaManagementDialog onClose={close} />);
  };
  render(): JSX.Element {
    return (
      <Observer>
        {() => (
          <TabController className="eph-h-full" orientation="vertical">
            <TabBar>
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
            <TabBody>
              <div>
                <Select
                  value={intlStore.language?.name ?? ""}
                  label={t("language")}
                  onChange={this.handleChangeLanguage}
                  className="w-32"
                  marginBottom
                >
                  {intlStore.languages.map((lang, index) => (
                    <option value={lang.name} key={index}>
                      {lang.nativeName}
                    </option>
                  ))}
                </Select>
                <div className="mb-2">
                  <Select
                    value={configStore.downloadProvider}
                    label={t("downloadProvider")}
                    onChange={() => {
                      // TODO Set Download Provider Here
                      /**/
                    }}
                    className="w-32"
                  >
                    <option value="official">{t("official")}</option>
                    <option value="bmclapi">BMCLAPI</option>
                    <option value="mcbbs">MCBBS</option>
                  </Select>
                  <p className="text-shallow">
                    {t("downloadProviderIsNotAble")}
                  </p>
                </div>
                <Select
                  label="Java"
                  className="mb-2"
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
                <Button onClick={this.handleManageJava}>
                  <FaJava /> {t("manageXxx", "Java")}
                </Button>
                <Checkbox
                  checked={configStore.hitokoto}
                  onChange={(checked) =>
                    setConfig((cfg) => (cfg.hitokoto = checked))
                  }
                >
                  {t("hitokoto")}
                </Checkbox>
                <p className="text-shallow">{t("hitokotoDescription")}</p>
                <div className="flex my-3 items-center space-x-3">
                  <Button
                    variant="contained"
                    onClick={this.handleUpdateCheck}
                    disabled={this.state.updateCheckResult === null}
                  >
                    {t("checkUpdate")}
                  </Button>
                  <Typography>
                    {this.state.updateCheckResult !== null ? (
                      this.state.updateCheckResult
                    ) : (
                      <Spin />
                    )}
                  </Typography>
                </div>
              </div>

              <div>
                <Select
                  value={configStore.theme}
                  label={t("theme")}
                  onChange={this.handleChangeTheme}
                  disabled={configStore.themeFollowOs}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </Select>
                <Checkbox
                  checked={configStore.themeFollowOs}
                  onChange={this.handleThemeFollowOs}
                >
                  {t("followOs")}
                </Checkbox>
              </div>

              <div className="space-y-3">
                <Card
                  variant="contained"
                  className="flex items-center space-x-3"
                >
                  <img
                    src={EpheromeLogo}
                    alt="EpheromeLogo"
                    className="w-16 h-16"
                  />
                  <div>
                    <Typography className="font-semibold text-xl">
                      Epherome Beta
                    </Typography>
                    <Typography>
                      {t("version")} {ephVersion}
                    </Typography>
                  </div>
                </Card>
                <Card variant="contained">
                  <div>
                    <Typography>
                      {t("os")}: {os.platform()} {os.arch()} {os.release()}
                    </Typography>
                  </div>
                  <div>
                    <Typography>
                      Electron: {process.versions.electron}
                    </Typography>
                    <Typography>Chrome: {process.versions.chrome}</Typography>
                    <Typography>Node.js: {process.versions.node}</Typography>
                    <Typography>V8: {process.versions.v8}</Typography>
                  </div>
                  <div>
                    <Typography>{t("cfgFilePath")}:</Typography>
                    <Link href={cfgPath} type="file">
                      {cfgPath}
                    </Link>
                    <Typography>{t("minecraftDirPath")}:</Typography>
                    <Link href={mcDownloadPath} type="file">
                      {mcDownloadPath}
                    </Link>
                  </div>
                </Card>
                <Card variant="contained">
                  <Typography>
                    {t("officialSite")}:{" "}
                    <Link href="https://epherome.com">
                      https://epherome.com
                    </Link>
                  </Typography>
                  <Typography>
                    GitHub:{" "}
                    <Link href="https://github.com/ResetPower/Epherome">
                      https://github.com/ResetPower/Epherome
                    </Link>
                  </Typography>
                  <Typography>Copyright © 2021 ResetPower.</Typography>
                  <Typography>
                    {t("oss")} | GNU General Public License 3.0
                  </Typography>
                </Card>
              </div>
            </TabBody>
          </TabController>
        )}
      </Observer>
    );
  }
}
