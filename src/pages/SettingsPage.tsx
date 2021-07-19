import { TextField, Select, Checkbox, Link } from "../components/inputs";
import { cfgPath, constraints, ephConfigs, mcDownloadPath, setConfig } from "../renderer/config";
import { t, i18n, logger } from "../renderer/global";
import { Typography, Card } from "../components/layouts";
import EpheromeLogo from "../../assets/Epherome.png";
import { MdInfo, MdPalette, MdTune } from "react-icons/md";
import { FaJava } from "react-icons/fa";
import { updateTheme } from "../renderer/theme";
import App from "../renderer/App";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { useState, useCallback } from "react";
import { useForceUpdater } from "../tools/hooks";

export default function SettingsPage(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const [javaPath, setJavaPath] = useState(ephConfigs.javaPath);
  const cnst = constraints;
  const changeLanguage = useCallback(
    (ev: string) => {
      i18n.changeLanguage(ev);
      setConfig(() => (ephConfigs.language = ev));
      forceUpdate();
      App.updateTitle();
      logger.info(`Language changed to '${ev}'`);
    },
    [forceUpdate]
  );
  const changeTheme = useCallback(
    (ev: string) => {
      setConfig(() => (ephConfigs.theme = ev));
      updateTheme();
      forceUpdate();
      logger.info(`Theme changed to '${ev}'`);
    },
    [forceUpdate]
  );
  const handleThemeFollowOs = useCallback(
    (checked: boolean) => {
      setConfig(() => {
        ephConfigs.themeFollowOs = checked;
        updateTheme();
      });
      forceUpdate();
    },
    [forceUpdate]
  );
  const saveJavaPath = useCallback(
    () =>
      (ephConfigs.javaPath !== javaPath &&
        setConfig(() => (ephConfigs.javaPath = javaPath))) as void,
    [javaPath]
  );

  // TODO save java path when component will unmount

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
            onChange={changeLanguage}
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
          <TextField
            label={t.javaPath}
            placeholder={t.javaPath}
            value={javaPath}
            icon={<FaJava />}
            onChange={(ev) => setJavaPath(ev)}
            trailing={
              <Link type="clickable" onClick={saveJavaPath}>
                {t.save}
              </Link>
            }
            marginBottom
          />
          <Checkbox
            checked={ephConfigs.hitokoto}
            onChange={(checked) => {
              setConfig(() => (ephConfigs.hitokoto = checked));
              forceUpdate();
            }}
          >
            {t.hitokoto}
          </Checkbox>
          <p className="text-shallow">{t.hitokotoDescription}</p>
        </div>

        <div>
          <Select
            value={ephConfigs.theme}
            label={t.theme}
            onChange={changeTheme}
            disabled={ephConfigs.themeFollowOs}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
          <Checkbox checked={ephConfigs.themeFollowOs} onChange={handleThemeFollowOs}>
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
            <Typography>Copyright © 2021 ResetPower. All rights reserved.</Typography>
            <Typography>{t.oss} | GNU General Public License 3.0</Typography>
          </Card>
        </div>
      </TabBody>
    </TabController>
  );
}
