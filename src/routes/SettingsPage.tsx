import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  makeStyles,
  Tab,
  Tabs,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import path from "path";
import React, { FunctionComponentElement, useState } from "react";
import Link from "../components/Link";
import { constraints, readConfig, writeConfig } from "../renderer/config";
import { theme, t, i18n, hist } from "../renderer/global";
import Paragraph from "../components/Paragraph";
import { useBindingState } from "../renderer/hooks";

const useStyle = makeStyles({
  root: {
    flexGrow: 1,
    display: "flex",
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  main: {
    paddingLeft: "1rem",
    paddingTop: "1rem",
  },
  btn: {
    marginRight: "10px",
  },
});

export default function SettingsPage(): FunctionComponentElement<EmptyProps> {
  const [value, setValue] = useState(0);
  const classes = useStyle();
  const cnst = constraints;
  const handleChange = (_ev: React.ChangeEvent<EmptyProps>, value: number) => {
    setValue(value);
  };

  const [language, setLanguage] = useState(i18n.language);
  const changeLanguage = (ev: React.ChangeEvent<{ value: unknown }>) => {
    const newLanguage = ev.target.value as string;
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
  };
  const [javaPath, changeJavaPath] = useBindingState(readConfig("javaPath", "java"));

  const save = () => {
    // save java path
    writeConfig("javaPath", javaPath, true);
    hist.goBack();
  };

  return (
    <div className={`eph-page ${classes.root}`}>
      <Tabs orientation="vertical" className={classes.tabs} value={value} onChange={handleChange}>
        <Tab label={t("general")} />
        <Tab label={t("appearance")} />
        <Tab label={t("about")} />
      </Tabs>
      <div className={classes.main}>
        <Box hidden={value !== 0}>
          <FormControl variant="filled" fullWidth>
            <InputLabel>Language</InputLabel>
            <Select value={language} onChange={changeLanguage}>
              <MenuItem value="en-us">English</MenuItem>
              <MenuItem value="zh-cn">中文简体</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Java Path"
            placeholder="Java Path"
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            value={javaPath}
            onChange={changeJavaPath}
            variant="filled"
            fullWidth
          />
          <div>
            <Button
              className={classes.btn}
              color="inherit"
              variant="contained"
              onClick={hist.goBack}
            >
              {t("cancel")}
            </Button>
            <Button color="secondary" variant="contained" onClick={save}>
              {t("save")}
            </Button>
          </div>
        </Box>
        <Box hidden={value !== 1}>
          <Typography>Sorry, there is no appearance settings yet.</Typography>
        </Box>
        <Box hidden={value !== 2}>
          <strong>Epherome: {cnst.version} (Alpha)</strong>
          <Paragraph>
            <Typography>
              {t("os")}: {cnst.platform} {cnst.arch} {cnst.release}
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
            <strong>
              {cnst.dir}
              {path.sep}config.json5
            </strong>
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
