import { useState } from "react";
import Checkbox from "../../components/Checkbox";
import Info from "../../components/Info";
import Select from "../../components/Select";
import { intlStore, t } from "../../intl";
import { cfg } from "../../stores/config";
import Button from "../../components/Button";
import { historyStore } from "../../router";

export default function GeneralFragment() {
  const [autoCollapse, setAutoCollapse] = useState(cfg.autoCollapse);

  return (
    <div className="space-y-6 p-3">
      <Info name={t.settings.displayLanguage}>
        <Select
          value={cfg.language}
          onChange={intlStore.updateLanguage}
          options={Object.fromEntries(
            intlStore.languages.map((x) => [x.code, x.name])
          )}
        />
      </Info>
      <Checkbox
        value={autoCollapse}
        onChange={(newValue) => {
          setAutoCollapse(newValue);
          cfg.autoCollapse = newValue;
        }}
      >
        {t.settings.autoCollapse}
      </Checkbox>
      <Button onClick={() => historyStore.go("debug")} primary>
        Debug Panel
      </Button>
    </div>
  );
}
