import TextField from "../components/TextField";
import Button from "../components/Button";
import Select from "../components/Select";
import { Component, ReactNode } from "react";
import Link from "../components/Link";
import {
  cfgPath,
  constraints,
  ephConfigs,
  EphDownloadProvider,
  setConfig,
} from "../renderer/config";
import { t, i18n, hist, logger } from "../renderer/global";
import { EmptyProps } from "../tools/types";
import { broadcast } from "../renderer/session";
import Typography from "../components/Typography";
import Checkbox from "../components/Checkbox";
import Icon from "../components/Icon";
import Card from "../components/Card";
import EpheromeLogo from "../../assets/Epherome.png";

export interface SettingsPageState {
  value: number;
  javaPath: string;
  hitokoto: boolean;
  downloadProvider: EphDownloadProvider;
}

export default class SettingsPage extends Component<EmptyProps, SettingsPageState> {
  state: SettingsPageState = {
    value: 0,
    javaPath: ephConfigs.javaPath,
    hitokoto: ephConfigs.hitokoto,
    downloadProvider: ephConfigs.downloadProvider,
  };
  cnst = constraints;
  changeLanguage = (ev: string): void => {
    i18n.changeLanguage(ev);
    setConfig(() => (ephConfigs.language = ev));
    this.setState({});
    broadcast("hist", hist.pathname());
    logger.info(`Language changed to '${ev}'`);
  };
  changeTheme = (ev: string): void => {
    setConfig(() => (ephConfigs.theme = ev));
    broadcast("theme");
    this.setState({});
    logger.info(`Theme changed to '${ev}'`);
  };
  save = (): void => {
    const jp = this.state.javaPath;
    const hk = this.state.hitokoto;
    const dp = this.state.downloadProvider;
    setConfig(() => {
      ephConfigs.javaPath = jp;
      ephConfigs.hitokoto = hk;
      ephConfigs.downloadProvider = dp;
    });
    logger.info(`Settings saved`);
    logger.debug([`Java Path: '${jp}'`, `Hitokoto: ${hk}`, `Download Provider: '${dp}'`]);
    hist.goBack();
  };
  TabItem = (props: { children: ReactNode; value: number }): JSX.Element => {
    return (
      <button
        className={`flex px-3 py-2 transition-colors duration-200 transform hover:bg-gray-200 active:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 rounded-md focus:outline-none ${
          this.state.value === props.value
            ? "font-bold text-blue-500 dark:text-indigo-400 bg-gray-200 dark:bg-gray-700"
            : "text-black dark:text-white"
        }`}
        onClick={() => this.setState({ value: props.value })}
      >
        {props.children}
      </button>
    );
  };
  render(): JSX.Element {
    return (
      <div className="flex">
        <div className="p-3 border-r border-divide space-y-1">
          <this.TabItem value={0}>
            <Icon>tune</Icon>
            {t.general}
          </this.TabItem>
          <this.TabItem value={1}>
            <Icon>palette</Icon>
            {t.appearance}
          </this.TabItem>
          <this.TabItem value={2}>
            <Icon>info</Icon>
            {t.about}
          </this.TabItem>
        </div>
        <div className="p-3 flex-grow">
          {this.state.value === 0 ? (
            <div>
              <Select
                value={i18n.language?.name ?? ""}
                label={t.language}
                onChange={this.changeLanguage}
                className="w-32"
                marginBottom
              >
                {i18n.languages.map((lang, index) => (
                  <option value={lang.name} key={index}>
                    {lang.nativeName}
                  </option>
                ))}
              </Select>
              <div className="mb-3">
                <Select
                  value={this.state.downloadProvider}
                  label={t.downloadProvider}
                  onChange={
                    () => {
                      /**/
                    }
                    /*(ev) =>
                this.setState({
                  downloadProvider: (ev.target.value as EphDownloadProvider) ?? "official",
                })*/
                  }
                  className="w-32"
                >
                  <option value="official">{t.official}</option>
                  <option value="bmclapi">BMCLAPI</option>
                  <option value="mcbbs">MCBBS</option>
                </Select>
                <p className="text-shallow">{t.downloadProviderIsNotAble}</p>
              </div>
              <TextField
                label={t.javaPath}
                placeholder={t.javaPath}
                value={this.state.javaPath}
                icon={<Icon>local_cafe</Icon>}
                onChange={(ev): void => {
                  this.setState({ javaPath: ev });
                }}
                marginBottom
              />
              <Checkbox
                checked={this.state.hitokoto}
                onChange={(checked) => this.setState({ hitokoto: checked })}
              >
                {t.hitokoto}
              </Checkbox>
              <p className="text-shallow">{t.hitokotoDescription}</p>
              <div className="flex">
                <Button className="text-gray-500" onClick={hist.goBack}>
                  {t.cancel}
                </Button>
                <Button className="text-blue-500" onClick={this.save}>
                  {t.save}
                </Button>
              </div>
            </div>
          ) : this.state.value === 1 ? (
            <div>
              <Select
                value={ephConfigs.theme}
                label={t.theme}
                onChange={this.changeTheme}
                disabled={ephConfigs.themeFollowOs}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
              <Checkbox
                checked={ephConfigs.themeFollowOs}
                onChange={(checked) =>
                  setConfig(() => {
                    ephConfigs.themeFollowOs = checked;
                    broadcast("theme");
                    this.setState({});
                  })
                }
              >
                {t.followOs}
              </Checkbox>
            </div>
          ) : this.state.value === 2 ? (
            <div className="space-y-3">
              <Card variant="contained" className="flex items-center space-x-3">
                <img src={EpheromeLogo} className="w-16 h-16" />
                <div>
                  <Typography className="font-semibold text-xl">Epherome</Typography>
                  <Typography>
                    {t.version} {this.cnst.version} (Alpha)
                  </Typography>
                </div>
              </Card>
              <Card variant="contained">
                <div>
                  <Typography>
                    {t.os}: {this.cnst.platform} {this.cnst.arch} {this.cnst.release}
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
                  <p className="text-gray-400">{cfgPath}</p>
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
                <Typography>Copyright © 2021 ResetPower. All rights reserved.</Typography>
                <Typography>{t.oss} | GNU General Public License 3.0</Typography>
              </Card>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}
