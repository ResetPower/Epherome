import TextField from "../components/TextField";
import Button from "../components/Button";
import Select from "../components/Select";
import path from "path";
import { Component, ChangeEvent, ReactNode } from "react";
import Link from "../components/Link";
import { constraints, ephConfigs, setConfig } from "../renderer/config";
import { t, i18n, hist } from "../renderer/global";
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
    broadcast("hist", hist.pathname());
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
  TabItem = (props: { children: ReactNode; value: number }): JSX.Element => {
    return (
      <button
        className={`block focus:outline-none ${
          this.state.value === props.value ? "text-pink-500" : ""
        }`}
        onClick={() => this.setState({ value: props.value })}
      >
        {props.children}
      </button>
    );
  };
  render(): JSX.Element {
    return (
      <div className="flex h-full">
        <div className="p-6 border-r border-divide">
          <this.TabItem value={0}>{t("general")}</this.TabItem>
          <this.TabItem value={1}>{t("appearance")}</this.TabItem>
          <this.TabItem value={2}>{t("about")}</this.TabItem>
        </div>
        <div className="p-3 flex-grow">
          <div hidden={this.state.value !== 0}>
            {t("language")}:
            <Select value={i18n.language} onChange={this.changeLanguage}>
              <SelectItem value="en-us">English</SelectItem>
              <SelectItem value="zh-cn">中文简体</SelectItem>
              <SelectItem value="ja-jp">日本語</SelectItem>
            </Select>
            <TextField
              label={t("javaPath")}
              placeholder={t("javaPath")}
              value={this.state.javaPath}
              onChange={this.changeJavaPath}
              variant="filled"
            />
            <div className="flex">
              <Button className="text-gray-500" onClick={hist.goBack}>
                {t("cancel")}
              </Button>
              <Button className="text-blue-500" onClick={this.save}>
                {t("save")}
              </Button>
            </div>
          </div>
          <div hidden={this.state.value !== 1}>
            {t("theme")}:
            <Select value={ephConfigs.theme} onChange={this.changeTheme}>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </Select>
          </div>
          <div className="space-y-3" hidden={this.state.value !== 2}>
            <strong>Epherome: {this.cnst.version} (Alpha)</strong>
            <div>
              <p>
                {t("os")}: {this.cnst.platform} {this.cnst.arch} {this.cnst.release}
              </p>
            </div>
            <div>
              <p>Electron: {process.versions.electron}</p>
              <p>Chrome: {process.versions.chrome}</p>
              <p>Node.js: {process.versions.node}</p>
              <p>V8: {process.versions.v8}</p>
            </div>
            <div>
              <p>{t("cfgFilePath")}:</p>
              <p className="text-gray-500">
                {this.cnst.dir}
                {path.sep}config.json5
              </p>
            </div>
            <div>
              <p>
                {t("officialSite")}: <Link href="https://epherome.com">https://epherome.com</Link>
              </p>
              <p>
                GitHub:{" "}
                <Link href="https://github.com/ResetPower/Epherome">
                  https://github.com/ResetPower/Epherome
                </Link>
              </p>
              <p>Copyright © 2021 ResetPower. All rights reserved.</p>
              <p>{t("oss")} | GNU General Public License 3.0</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
