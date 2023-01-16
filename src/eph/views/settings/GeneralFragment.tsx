import { Button, Checkbox, Select, Spinner, WithHelper } from "@resetpower/rcs";
import { rendererLogger } from "common/loggers";
import { configStore, setConfig } from "common/struct/config";
import { intlStore, t } from "eph/intl";
import { showOverlay } from "eph/overlay";
import { checkEphUpdate } from "eph/renderer/updater";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FaJava } from "react-icons/fa";
import JavaManagementSheet from "./JavaManagementSheet";
import UpdateAvailableDialog from "./UpdateAvailableDialog";

const SettingsGeneralFragment = observer(() => {
  const [result, setResult] = useState<string | null>("");

  const handleUpdateCheck = () => {
    setResult(null);
    checkEphUpdate().then((result) => {
      if (result) {
        if (result.need) {
          setResult(t("epheromeUpdate.available", result.name));
          showOverlay({
            title: t("epheromeUpdate"),
            content: UpdateAvailableDialog,
            params: {
              version: result.name,
            },
          });
        } else {
          setResult(t("epheromeUpdate.needNot"));
        }
      } else {
        setResult(t("internetNotAvailable"));
      }
    });
  };
  const handleChangeLanguage = (ev: string) => {
    rendererLogger.info(`Changing language to ${ev}'`);
    intlStore.setLanguage(ev);
    setResult("");
  };
  const handleManageJava = () => {
    showOverlay({
      type: "sheet",
      title: t("java.manage"),
      content: JavaManagementSheet,
    });
  };

  return (
    <div className="space-y-2">
      <WithHelper helper={t("settings.languageHelper")}>
        <Select
          value={intlStore.language?.name ?? ""}
          label={t("language")}
          onChange={handleChangeLanguage}
          options={intlStore.languages.map((lang) => ({
            value: lang.name,
            text: lang.nativeName,
            className: `eph-force-${lang.name}`,
          }))}
        />
      </WithHelper>
      <Button onClick={handleManageJava}>
        <FaJava /> {t("java.manage")}
      </Button>
      <Checkbox
        checked={configStore.developerMode}
        onChange={(checked) =>
          setConfig((cfg) => (cfg.developerMode = checked))
        }
      >
        {t("settings.devMode")}
      </Checkbox>
      <Checkbox
        checked={configStore.allowNotificationDot}
        onChange={(checked) =>
          setConfig((cfg) => (cfg.allowNotificationDot = checked))
        }
      >
        {t("settings.allowNotificationDot")}
      </Checkbox>
      <Checkbox
        checked={configStore.checkUpdate}
        onChange={(checked) => setConfig((cfg) => (cfg.checkUpdate = checked))}
      >
        {t("settings.autoCheckUpdate")}
      </Checkbox>

      <div className="flex my-3 items-center space-x-3">
        <Button
          variant="contained"
          onClick={handleUpdateCheck}
          disabled={result === null}
        >
          {t("epheromeUpdate.check")}
        </Button>
        <p>{result !== null ? result : <Spinner />}</p>
      </div>
    </div>
  );
});

export default SettingsGeneralFragment;
