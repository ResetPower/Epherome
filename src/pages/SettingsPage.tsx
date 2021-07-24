import { Select, Checkbox, Link, Button, TextField, IconButton } from "../components/inputs";
import { cfgPath, constraints, ephConfigs, mcDownloadPath, setConfig } from "../renderer/config";
import { t, i18n, logger, hist } from "../renderer/global";
import { Typography, Card } from "../components/layouts";
import EpheromeLogo from "../../assets/Epherome.png";
import { MdClose, MdInfo, MdPalette, MdTune } from "react-icons/md";
import { updateTheme } from "../renderer/theme";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { checkEphUpdate } from "../renderer/updater";
import Spin from "../components/Spin";
import GlobalOverlay from "../components/GlobalOverlay";
import { UpdateAvailableDialog } from "../components/Dialogs";
import { FlexibleComponent } from "../tools/component";
import { DefaultFunction, EmptyObject } from "../tools/types";
import { FaJava } from "react-icons/fa";
import Dialog from "../components/Dialog";
import { useController, useForceUpdater } from "../tools/hooks";
import { List, ListItem, ListItemText } from "../components/lists";
import { checkJavaVersion, createJava, detectJava, removeJava } from "../struct/java";
import { useState, useCallback } from "react";

export function JavaManagementDialog(props: { onClose: DefaultFunction }): JSX.Element {
  const forceUpdate = useForceUpdater();
  const [err, setErr] = useState<string | null>(null);
  const newJavaController = useController("", () => setErr(""));
  const javas = ephConfigs.javas;
  const checkDuplicate = useCallback(
    (dir: string) => {
      for (const i of javas) {
        if (i.dir === dir) {
          setErr("Duplicate Java Path");
          return true;
        }
      }
      return false;
    },
    [javas]
  );

  return (
    <Dialog className="eph-max-h-full flex flex-col overflow-hidden" indentBottom>
      <Typography className="font-semibold text-xl">Java Management</Typography>
      <List className="overflow-y-scroll">
        {javas.map((value, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={
                value.name + " (" + t.xxxBit.replace("{}", value.is64Bit ? "64" : "32") + ") "
              }
              secondary={value.dir}
              longSecondary
            />
            <div className="flex-grow"></div>
            <IconButton
              onClick={() => {
                removeJava(value.id);
                forceUpdate();
              }}
            >
              <MdClose />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <TextField
        {...newJavaController}
        error={err ? true : false}
        helperText={err ?? undefined}
        icon={<FaJava />}
        placeholder="New Java Path..."
        trailing={
          <Link
            type="clickable"
            onClick={() => {
              const val = newJavaController.value;
              if (checkDuplicate(val)) return;
              setErr(null);
              checkJavaVersion(val).then((result) => {
                if (result) {
                  createJava(result);
                  forceUpdate();
                } else setErr("Invalid Java Path");
              });
            }}
          >
            Add
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
          Detect
        </Button>
        <div className="flex-grow"></div>
        <Button onClick={props.onClose}>{t.ok}</Button>
      </div>
    </Dialog>
  );
}

export interface SettingsPageState {
  updateCheckResult?: string;
}

export default class SettingsPage extends FlexibleComponent<EmptyObject, SettingsPageState> {
  state: SettingsPageState = {
    updateCheckResult: "",
  };
  handleUpdateCheck = (): void => {
    this.setState({
      updateCheckResult: undefined,
    });
    checkEphUpdate().then((result) => {
      if (result) {
        if (result.need) {
          this.setState({ updateCheckResult: t.updateAvailable.replace("{}", result.name) });
          GlobalOverlay.showDialog((close) => (
            <UpdateAvailableDialog version={result.name} onClose={close} />
          ));
        } else {
          this.setState({ updateCheckResult: t.youAreUsingTheLatestVersion });
        }
      } else {
        this.setState({ updateCheckResult: t.cannotConnectToInternet });
      }
    });
  };
  handleChangeLanguage = (ev: string): void => {
    i18n.changeLanguage(ev);
    setConfig({ language: ev });
    hist.dispatch();
    this.setState({ updateCheckResult: undefined });
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
    GlobalOverlay.showDialog((close) => (
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
            {t.general}
          </TabBarItem>
          <TabBarItem value={1}>
            <MdPalette />
            {t.appearance}
          </TabBarItem>
          <TabBarItem value={2}>
            <MdInfo />
            {t.about}
          </TabBarItem>
        </TabBar>
        <TabBody>
          <div>
            <Select
              value={i18n.language?.name ?? ""}
              label={t.language}
              onChange={this.handleChangeLanguage}
              className="w-32"
              marginBottom
            >
              {i18n.languages.map((lang, index) => (
                <option value={lang.name} key={index}>
                  {lang.nativeName}
                </option>
              ))}
            </Select>
            <div className="mb-2">
              <Select
                value={ephConfigs.downloadProvider}
                label={t.downloadProvider}
                onChange={() => {
                  // TODO Set Download Provider Here
                  /**/
                }}
                className="w-32"
              >
                <option value="official">{t.official}</option>
                <option value="bmclapi">BMCLAPI</option>
                <option value="mcbbs">MCBBS</option>
              </Select>
              <p className="text-shallow">{t.downloadProviderIsNotAble}</p>
            </div>
            <Select
              label="Java"
              className="mb-2"
              value={ephConfigs.selectedJava.toString()}
              onChange={(value) => {
                setConfig({ selectedJava: parseInt(value) });
                this.updateUI();
              }}
            >
              {ephConfigs.javas.map((value, index) => (
                <option value={value.id} key={index}>
                  {value.name}
                </option>
              ))}
            </Select>
            <Button onClick={this.handleManageJava}>
              <FaJava /> Java Management
            </Button>
            <Checkbox
              checked={ephConfigs.hitokoto}
              onChange={(checked) => {
                setConfig({ hitokoto: checked });
                this.updateUI();
              }}
            >
              {t.hitokoto}
            </Checkbox>
            <p className="text-shallow">{t.hitokotoDescription}</p>
            <div className="flex my-3 items-center space-x-3">
              <Button
                variant="contained"
                onClick={this.handleUpdateCheck}
                disabled={(() => {
                  return this.state.updateCheckResult === undefined;
                })()}
              >
                {t.checkUpdate}
              </Button>
              <Typography>
                {this.state.updateCheckResult !== undefined ? (
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
              label={t.theme}
              onChange={this.handleChangeTheme}
              disabled={ephConfigs.themeFollowOs}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
            <Checkbox checked={ephConfigs.themeFollowOs} onChange={this.handleThemeFollowOs}>
              {t.followOs}
            </Checkbox>
          </div>

          <div className="space-y-3">
            <Card variant="contained" className="flex items-center space-x-3">
              <img src={EpheromeLogo} className="w-16 h-16" />
              <div>
                <Typography className="font-semibold text-xl">Epherome Beta</Typography>
                <Typography>
                  {t.version} {cnst.version}
                </Typography>
              </div>
            </Card>
            <Card variant="contained">
              <div>
                <Typography>
                  {t.os}: {cnst.platform} {cnst.arch} {cnst.release}
                </Typography>
              </div>
              <div>
                <Typography>Electron: {process.versions.electron}</Typography>
                <Typography>Chrome: {process.versions.chrome}</Typography>
                <Typography>Node.js: {process.versions.node}</Typography>
                <Typography>V8: {process.versions.v8}</Typography>
              </div>
              <div>
                <Typography>{t.cfgFilePath}:</Typography>
                <Link href={cfgPath} type="file">
                  {cfgPath}
                </Link>
                <Typography>{t.minecraftDirPath}:</Typography>
                <Link href={mcDownloadPath} type="file">
                  {mcDownloadPath}
                </Link>
              </div>
            </Card>
            <Card variant="contained">
              <Typography>
                {t.officialSite}: <Link href="https://epherome.com">https://epherome.com</Link>
              </Typography>
              <Typography>
                GitHub:{" "}
                <Link href="https://github.com/ResetPower/Epherome">
                  https://github.com/ResetPower/Epherome
                </Link>
              </Typography>
              <Typography>Copyright © 2021 ResetPower.</Typography>
              <Typography>{t.oss} | GNU General Public License 3.0</Typography>
            </Card>
          </div>
        </TabBody>
      </TabController>
    );
  }
}
