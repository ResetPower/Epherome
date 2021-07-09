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
        className={`block focus:outline-none ${
          this.state.value === props.value ? "text-pink-500" : "text-black dark:text-white"
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
        <div className="p-6 border-r border-divide">
          <this.TabItem value={0}>{t.general}</this.TabItem>
          <this.TabItem value={1}>{t.appearance}</this.TabItem>
          <this.TabItem value={2}>{t.about}</this.TabItem>
        </div>
        <div className="p-3 flex-grow">
          <div hidden={this.state.value !== 0}>
            <Typography>{t.language}</Typography>
            <Select value={i18n.language?.name ?? ""} onChange={this.changeLanguage}>
              {i18n.languages.map((lang, index) => (
                <option value={lang.name} key={index}>
                  {lang.nativeName}
                </option>
              ))}
            </Select>
            <br />
            <br />
            <Typography>{t.downloadProvider}</Typography>
            <Select
              value={this.state.downloadProvider}
              onChange={
                () => {
                  /**/
                }
                /*(ev) =>
                this.setState({
                  downloadProvider: (ev.target.value as EphDownloadProvider) ?? "official",
                })*/
              }
            >
              <option value="official">{t.official}</option>
              <option value="bmclapi">BMCLAPI</option>
              <option value="mcbbs">MCBBS</option>
            </Select>
            <Typography>{t.downloadProviderIsNotAble}</Typography>
            <br />
            <TextField
              label={t.javaPath}
              placeholder={t.javaPath}
              value={this.state.javaPath}
              onChange={(ev): void => {
                this.setState({ javaPath: ev });
              }}
              variant="filled"
            />
            <br />
            <Checkbox
              checked={this.state.hitokoto}
              onChange={(checked) => this.setState({ hitokoto: checked })}
            >
              {t.hitokoto}
            </Checkbox>
            <Typography>{t.hitokotoDescription}</Typography>
            <div className="flex">
              <Button className="text-gray-500" onClick={hist.goBack}>
                {t.cancel}
              </Button>
              <Button className="text-blue-500" onClick={this.save}>
                {t.save}
              </Button>
            </div>
          </div>
          <div hidden={this.state.value !== 1}>
            <Typography>{t.theme}</Typography>
            <Select value={ephConfigs.theme} onChange={this.changeTheme}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
          <div className="space-y-3" hidden={this.state.value !== 2}>
            <Typography className="font-bold">Epherome: {this.cnst.version} (Alpha)</Typography>
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
            <div>
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}
