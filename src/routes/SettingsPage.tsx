import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import path from "path";
import { Component, ChangeEvent } from "react";
import Link from "../components/Link";
import { constraints, ephConfigs, setConfig } from "../renderer/config";
import { t, i18n, hist } from "../renderer/global";
import Paragraph from "../components/Paragraph";
import "../styles/settings.css";
import { EmptyProps } from "../tools/types";
import { broadcast } from "../renderer/session";

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
      <div className={"eph-page eph-root"}>
        <Tabs orientation="vertical" value={this.state.value} onChange={this.handleChange}>
          <Tab value={0} label={t("general")} />
          <Tab value={1} label={t("appearance")} />
          <Tab value={2} label={t("about")} />
        </Tabs>
        <div className={"eph-set-main"}>
          <Box hidden={this.state.value !== 0}>
            <FormControl variant="filled" fullWidth>
              <InputLabel>{t("language")}</InputLabel>
              <Select value={i18n.language} onChange={this.changeLanguage}>
                <MenuItem value="en-us">English</MenuItem>
                <MenuItem value="zh-cn">中文简体</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t("javaPath")}
              placeholder={t("javaPath")}
              margin="normal"
              value={this.state.javaPath}
              onChange={this.changeJavaPath}
              variant="filled"
              fullWidth
            />
            <div>
              <Button className={"eph-set-btn"} onClick={hist.goBack}>
                {t("cancel")}
              </Button>
              <Button color="secondary" onClick={this.save}>
                {t("save")}
              </Button>
            </div>
          </Box>
          <Box hidden={this.state.value !== 1}>
            <FormControl variant="filled" fullWidth>
              <InputLabel>{t("theme")}</InputLabel>
              <Select value={ephConfigs.theme} onChange={this.changeTheme}>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box hidden={this.state.value !== 2}>
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
              <Typography color="secondary">
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
          </Box>
        </div>
      </div>
    );
  }
}
