import {
  Checkbox,
  Hyperlink,
  IconButton,
  ListItem,
  rcsDark,
  rcsLight,
  Select,
  TextField,
  WithHelper,
} from "@resetpower/rcs";
import { rendererLogger } from "common/loggers";
import {
  configStore,
  FnBoardPlacement,
  setConfig,
  TitleBarStyle,
} from "common/struct/config";
import { adapt } from "common/utils";
import { ipcRenderer } from "electron";
import SectionTitle from "eph/components/SectionTitle";
import { updateTheme } from "eph/index";
import { t } from "eph/intl";
import { showOverlay } from "eph/overlay";
import { observer } from "mobx-react-lite";
import { MdAdd, MdClose } from "react-icons/md";
import NewThemeView from "../NewThemeView";

const SettingsAppearanceFragment = observer(() => {
  const theme = configStore.theme;

  const handleChangeTheme = (ev: string) => {
    if (!configStore.themeFollowOs) {
      rendererLogger.info(`Changing theme to '${ev}'`);
      setConfig((cfg) => (cfg.theme = ev));
      updateTheme();
    }
  };
  const handleThemeFollowOs = (checked: boolean) => {
    rendererLogger.info(`Theme follow OS is ${checked ? "on" : "off"}`);
    setConfig((cfg) => (cfg.themeFollowOs = checked));
    updateTheme();
  };
  const handleChangeTitleBarStyle = (ev: string) => {
    if (ev !== configStore.titleBarStyle) {
      setConfig((cfg) => (cfg.titleBarStyle = ev as TitleBarStyle));
      showOverlay({ message: t("settings.titleBar.message") });
    }
  };
  const handleOpenBgPath = () => {
    ipcRenderer
      .invoke("open-image")
      .then((value) => setConfig((cfg) => (cfg.bgPath = value)));
  };

  return (
    <div className="space-y-3">
      <div>
        <SectionTitle>Window</SectionTitle>
        <Select
          className="mb-3"
          value={configStore.titleBarStyle}
          label={t("settings.titleBar")}
          options={[
            { value: "os", text: "OS" },
            { value: "eph", text: "Eph" },
          ]}
          onChange={handleChangeTitleBarStyle}
        />
        <WithHelper helper={t("rememberWindowSize.description")}>
          <Checkbox
            checked={configStore.rememberWindowSize}
            onChange={(checked) =>
              setConfig((cfg) => (cfg.rememberWindowSize = checked))
            }
          >
            {t("rememberWindowSize")}
          </Checkbox>
        </WithHelper>
      </div>
      <div>
        <SectionTitle>{t("backgroundPhoto")}</SectionTitle>
        <Checkbox
          checked={configStore.enableBg}
          onChange={(checked) => setConfig((cfg) => (cfg.enableBg = checked))}
        >
          {t("enableBackgroundPhoto")}
        </Checkbox>
        {configStore.enableBg && (
          <div className="mt-3">
            <Select
              label={t("functionBoardPlacement")}
              options={[
                {
                  value: "off",
                  text: t("placement.off"),
                },
                { value: "top", text: t("placement.top") },
                { value: "right", text: t("placement.right") },
              ]}
              value={configStore.fnBoardPlacement}
              onChange={(value) =>
                setConfig(
                  (cfg) => (cfg.fnBoardPlacement = value as FnBoardPlacement)
                )
              }
            />
            <TextField
              value={configStore.bgPath}
              onChange={(value) => setConfig((cfg) => (cfg.bgPath = value))}
              label={t("filePath")}
              trailing={
                <Hyperlink button onClick={handleOpenBgPath}>
                  {t("profile.openDirectory")}
                </Hyperlink>
              }
            />
          </div>
        )}
      </div>
      <div>
        <SectionTitle>{t("settings.theme")}</SectionTitle>
        <Checkbox
          checked={configStore.themeFollowOs}
          onChange={handleThemeFollowOs}
        >
          {t("settings.theme.followOS")}
        </Checkbox>
        {[rcsLight, rcsDark, ...configStore.themeList].map((value, index) => (
          <div className="flex" key={index}>
            <ListItem
              className="flex-grow"
              active={theme === value.name}
              onClick={() => handleChangeTheme(value.name)}
            >
              {value.name}
            </ListItem>
            {!adapt(value, rcsLight, rcsDark) && (
              <IconButton
                onClick={() =>
                  showOverlay({
                    title: t("warning"),
                    message: t("confirmRemoving"),
                    cancellable: true,
                    action: () => {
                      setConfig(
                        (cfg) =>
                          (cfg.themeList = cfg.themeList.filter(
                            (t) => t !== value
                          ))
                      );
                    },
                  })
                }
              >
                <MdClose />
              </IconButton>
            )}
          </div>
        ))}
        <ListItem
          onClick={() =>
            showOverlay({
              type: "sheet",
              title: t("theme.newTheme"),
              content: NewThemeView,
            })
          }
        >
          <MdAdd /> {t("theme.create")}
        </ListItem>
      </div>
    </div>
  );
});

export default SettingsAppearanceFragment;
