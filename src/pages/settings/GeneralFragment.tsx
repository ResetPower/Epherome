import Info from "../../components/Info";
import Select from "../../components/Select";
import { intlStore, t } from "../../intl";
import { cfg } from "../../stores/config";

export default function GeneralFragment() {
  return (
    <div>
      <div>
        <Info name={t.settings.displayLanguage}>
          <Select
            value={cfg.language}
            onChange={intlStore.updateLanguage}
            options={Object.fromEntries(
              intlStore.languages.map((x) => [x.code, x.name])
            )}
          />
        </Info>
      </div>
    </div>
  );
}
