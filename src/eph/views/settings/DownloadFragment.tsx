import {
  Button,
  Hyperlink,
  Select,
  TextField,
  WithHelper,
} from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import { ephDefaultDotMinecraft } from "common/utils/info";
import { MinecraftDownloadProvider } from "core/url";
import { ipcRenderer } from "electron";
import { t } from "eph/intl";
import { observer } from "mobx-react-lite";

const SettingsDownloadFragment = observer(() => {
  const handleOpenTarget = () =>
    ipcRenderer
      .invoke("open-directory")
      .then((value) => setConfig((cfg) => (cfg.downloadTarget = value)));
  const handleRestore = () =>
    setConfig((cfg) => (cfg.downloadTarget = ephDefaultDotMinecraft));

  return (
    <div className="space-y-3">
      <WithHelper helper={t("settings.downloadProvider.description")}>
        <Select
          value={configStore.downloadProvider}
          label={t("settings.downloadProvider")}
          options={[
            {
              value: "official",
              text: t("settings.downloadProvider.official"),
            },
            { value: "bmclapi", text: "BMCLAPI (Mainland China)" },
            { value: "mcbbs", text: "MCBBS (Mainland China)" },
          ]}
          onChange={(provider) =>
            setConfig(
              (cfg) =>
                (cfg.downloadProvider = provider as MinecraftDownloadProvider)
            )
          }
        />
      </WithHelper>
      <TextField
        min={1}
        max={10}
        value={configStore.downloadConcurrency.toString()}
        type="number"
        label={t("settings.downloadConcurrency")}
        helperText={t("settings.downloadCurrency.description")}
        fieldClassName="w-32"
        onChange={(concurrency) => {
          const value = +concurrency;
          value > 0 &&
            value < 11 &&
            setConfig((cfg) => (cfg.downloadConcurrency = value));
        }}
      />
      <WithHelper helper="The target minecraft (or .minecraft) folder of Minecraft installations.">
        <TextField
          label="Download Target"
          value={configStore.downloadTarget}
          onChange={(value) => setConfig((cfg) => (cfg.downloadTarget = value))}
          trailing={
            <div className="flex items-center">
              <Hyperlink button onClick={handleOpenTarget}>
                {t("profile.openDirectory")}
              </Hyperlink>
            </div>
          }
        />
        <Button variant="pill" onClick={handleRestore}>
          Restore Default
        </Button>
      </WithHelper>
    </div>
  );
});

export default SettingsDownloadFragment;
