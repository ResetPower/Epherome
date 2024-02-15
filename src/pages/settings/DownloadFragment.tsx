import { useState } from "react";
import Info from "../../components/Info";
import Select from "../../components/Select";
import { MinecraftDownloadProvider } from "../../core/url";
import { t } from "../../intl";
import { cfg } from "../../stores/config";

export default function DownloadFragment() {
  const [provider, setProvider] = useState(cfg.downloadProvider);

  return (
    <div className="p-3">
      <Info name={t.settings.downloadProvider}>
        <Select
          value={provider}
          onChange={(newValue) => {
            cfg.downloadProvider = newValue as MinecraftDownloadProvider;
            setProvider(newValue as MinecraftDownloadProvider);
          }}
          options={{ official: t.official, bmclapi: "BMCLAPI", mcbbs: "MCBBS" }}
        ></Select>
      </Info>
    </div>
  );
}
