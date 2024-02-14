import { useState } from "react";
import Info from "../../components/Info";
import Select from "../../components/Select";
import { cfg } from "../../stores/config";
import { Theme, themeStore } from "../../stores/theme";

export default function AppearanceFragment() {
  const [theme, setTheme] = useState(cfg.theme);

  return (
    <div className="p-3">
      <Info name="Color Theme">
        <Select
          options={{ follow: "Follow OS", light: "Light", dark: "Dark" }}
          value={theme}
          onChange={(newValue) => {
            setTheme(newValue as Theme);
            themeStore.updateTheme(newValue as Theme);
          }}
        />
      </Info>
    </div>
  );
}
