import Info from "../../components/Info";
import Select from "../../components/Select";
import { MinecraftDownloadProvider } from "../../core/url";
import { t } from "../../intl";
import { cfg } from "../../stores/config";

export default function DownloadFragment() {
  return (
    <div>
      <Info name={t.settings.downloadProvider}>
        <Select
          value={cfg.downloadProvider}
          onChange={(newValue) => {
            cfg.downloadProvider = newValue as MinecraftDownloadProvider;
          }}
          options={{ official: "Official", bmclapi: "BMCLAPI", mcbbs: "MCBBS" }}
        ></Select>
      </Info>
    </div>
  );
}
