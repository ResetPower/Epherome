import TextField from "../components/TextField";
import Button from "../components/Button";
import Typography from "../components/Typography";
import Select from "../components/Select";
import path from "path";
import { Component, ChangeEvent } from "react";
import Link from "../components/Link";
import { constraints, ephConfigs, setConfig } from "../renderer/config";
import { t, i18n, hist } from "../renderer/global";
import Paragraph from "../components/Paragraph";
import { EmptyProps } from "../tools/types";
import { broadcast } from "../renderer/session";
import SelectItem from "../components/SelectItem";

export interface SettingsPageState {
  value: number;
  javaPath: string;
}

export default class SettingsPage extends Component<EmptyProps, SettingsPageState> {
  state: SettingsPageState = {
    value: 0,
    javaPath: ephConfigs.javaPath,
  };
  cnst = constraints;
  handleChange = (_ev: ChangeEvent<EmptyProps>, value: number): void =>
    this.setState({ value: value });
  changeLanguage = (ev: ChangeEvent<{ value: unknown }>): void => {
    const newLanguage = ev.target.value as string;
    i18n.changeLanguage(newLanguage);
    setConfig(() => (ephConfigs.language = newLanguage));
    this.setState({});
  };
  changeTheme = (ev: ChangeEvent<{ value: unknown }>): void => {
    setConfig(() => (ephConfigs.theme = ev.target.value as string));
    broadcast("theme");
    this.setState({});
  };
  changeJavaPath = (ev: ChangeEvent<{ value: unknown }>): void => {
    this.setState({ javaPath: ev.target.value as string });
  };
  save = (): void => {
    setConfig(() => (ephConfigs.javaPath = this.state.javaPath));
    hist.goBack();
  };
  render(): JSX.Element {
    return (
      <div className="eph-page flex">
        <div>
          <div
            onClick={() => {
              this.setState({ value: 0 });
            }}
          >
            {t("general")}
          </div>
          <div
            onClick={() => {
              this.setState({ value: 1 });
            }}
          >
            {t("appearance")}
          </div>
          <div
            onClick={() => {
              this.setState({ value: 2 });
            }}
          >
            {t("about")}
          </div>
        </div>
        <div className="pl-4 pt-4">
          <div hidden={this.state.value !== 0}>
            {t("language")}:
            <Select value={i18n.language} onChange={this.changeLanguage}>
              <SelectItem value="en-us">English</SelectItem>
              <SelectItem value="zh-cn">中文简体</SelectItem>
            </Select>
            <TextField
              label={t("javaPath")}
              placeholder={t("javaPath")}
              value={this.state.javaPath}
              onChange={this.changeJavaPath}
              variant="filled"
            />
            <div>
              <Button onClick={hist.goBack}>{t("cancel")}</Button>
              <Button onClick={this.save}>{t("save")}</Button>
            </div>
          </div>
          <div hidden={this.state.value !== 1}>
            {t("theme")}:
            <Select value={ephConfigs.theme} onChange={this.changeTheme}>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </Select>
          </div>
          <div hidden={this.state.value !== 2}>
            <strong>Epherome: {this.cnst.version} (Alpha)</strong>
            <Paragraph>
              <Typography>
                {t("os")}: {this.cnst.platform} {this.cnst.arch} {this.cnst.release}
              </Typography>
            </Paragraph>
            <Paragraph>
              <Typography>Electron: {process.versions.electron}</Typography>
              <Typography>Chrome: {process.versions.chrome}</Typography>
              <Typography>Node.js: {process.versions.node}</Typography>
              <Typography>V8: {process.versions.v8}</Typography>
            </Paragraph>
            <Paragraph>
              <Typography>{t("cfgFilePath")}:</Typography>
              <Typography>
                {this.cnst.dir}
                {path.sep}config.json5
              </Typography>
            </Paragraph>
            <Paragraph>
              <Typography>
                {t("officialSite")}: <Link href="https://epherome.com">https://epherome.com</Link>
              </Typography>
              <Typography>
                GitHub:{" "}
                <Link href="https://github.com/ResetPower/Epherome">
                  https://github.com/ResetPower/Epherome
                </Link>
              </Typography>
              <Typography>Copyright © 2021 ResetPower. All rights reserved.</Typography>
              <Typography>{t("oss")} | GNU General Public License 3.0</Typography>
            </Paragraph>
          </div>
        </div>
      </div>
    );
  }
}
