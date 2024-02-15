import { useState } from "react";
import Info from "../../components/Info";
import Select from "../../components/Select";
import { cfg } from "../../stores/config";
import { Theme, themeStore } from "../../stores/theme";
import { t } from "../../intl";

export default function AppearanceFragment() {
  const [theme, setTheme] = useState(cfg.theme);

  return (
    <div className="p-3">
      <Info name={t.settings.theme}>
        <Select
          options={{
            follow: t.settings.themes.followOs,
            light: t.settings.themes.light,
            dark: t.settings.themes.dark,
          }}
          value={theme}
          onChange={(newValue) => {
            themeStore.updateTheme(newValue as Theme);
            setTheme(newValue as Theme);
          }}
        />
      </Info>
    </div>
  );
}
