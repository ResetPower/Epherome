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
  constraints,
  ephConfigs,
  mcDownloadPath,
  setConfig,
} from "../struct/config";
import { logger, hist } from "../renderer/global";
import { Typography, Card } from "../components/layouts";
import EpheromeLogo from "../../assets/Epherome.png";
import { MdClose, MdInfo, MdPalette, MdTune } from "react-icons/md";
import { updateTheme } from "../renderer/theme";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { checkEphUpdate } from "../renderer/updater";
import Spin from "../components/Spin";
import { showDialog } from "../components/GlobalOverlay";
import { UpdateAvailableDialog } from "../components/Dialogs";
import { FlexibleComponent } from "../tools/component";
import { DefaultFn, EmptyObject } from "../tools/types";
import { FaJava } from "react-icons/fa";
import Dialog from "../components/Dialog";
import { List, ListItem, ListItemText } from "../components/lists";
import {
  checkJavaVersion,
  createJava,
  detectJava,
  removeJava,
} from "../struct/java";
import { useState, useCallback } from "react";
import { useReducer } from "react";
import { t, intlStore } from "../intl";

export function JavaManagementDialog(props: {
  onClose: DefaultFn;
}): JSX.Element {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [err, setErr] = useState<string | null>(null);
  const [newJavaPath, setNewJavaPath] = useState("");
  const javas = ephConfigs.javas;
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
                forceUpdate();
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
                forceUpdate();
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
  );
}

export interface SettingsPageState {
  updateCheckResult: string | null;
}

export default class SettingsPage extends FlexibleComponent<
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
    setConfig({ language: ev });
    hist.dispatch();
    this.setState({ updateCheckResult: "" });
    logger.info(`Language changed to '${ev}'`);
  };
  handleChangeTheme = (ev: string): void => {
    setConfig({ theme: ev });
    updateTheme();
    this.updateUI();
    logger.info(`Theme changed to '${ev}'`);
  };
  handleThemeFollowOs = (checked: boolean): void => {
    setConfig({ themeFollowOs: checked });
    updateTheme();
    this.updateUI();
  };
  handleManageJava = (): void => {
    showDialog((close) => (
      <JavaManagementDialog
        onClose={() => {
          close();
          this.updateUI();
        }}
      />
    ));
  };
  render(): JSX.Element {
    const cnst = constraints;

    return (
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
                value={ephConfigs.downloadProvider}
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
              <p className="text-shallow">{t("downloadProviderIsNotAble")}</p>
            </div>
            <Select
              label="Java"
              className="mb-2"
              value={ephConfigs.javas.getSelectedIndex()?.toString() ?? ""}
              onChange={(value) => {
                setConfig((cfg) => cfg.javas.select(cfg.javas[+value]));
                this.updateUI();
              }}
            >
              {ephConfigs.javas.map((value, index) => (
                <option value={index} key={index}>
                  {value.name}
                </option>
              ))}
            </Select>
            <Button onClick={this.handleManageJava}>
              <FaJava /> {t("manageXxx", "Java")}
            </Button>
            <Checkbox
              checked={ephConfigs.hitokoto}
              onChange={(checked) => {
                setConfig({ hitokoto: checked });
                this.updateUI();
              }}
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
              value={ephConfigs.theme}
              label={t("theme")}
              onChange={this.handleChangeTheme}
              disabled={ephConfigs.themeFollowOs}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
            <Checkbox
              checked={ephConfigs.themeFollowOs}
              onChange={this.handleThemeFollowOs}
            >
              {t("followOs")}
            </Checkbox>
          </div>

          <div className="space-y-3">
            <Card variant="contained" className="flex items-center space-x-3">
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
                  {t("version")} {cnst.version}
                </Typography>
              </div>
            </Card>
            <Card variant="contained">
              <div>
                <Typography>
                  {t("os")}: {cnst.platform} {cnst.arch} {cnst.release}
                </Typography>
              </div>
              <div>
                <Typography>Electron: {process.versions.electron}</Typography>
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
                <Link href="https://epherome.com">https://epherome.com</Link>
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
    );
  }
}
