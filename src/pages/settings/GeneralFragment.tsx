import Select from "../../components/Select";
import { intlStore, t } from "../../intl";
import { cfg } from "../../stores/config";

export default function GeneralFragment() {
  return (
    <div>
      <div>
        <div>{t.settings.displayLanguage}</div>
        <Select
          value={cfg.language}
          onChange={intlStore.updateLanguage}
          options={Object.fromEntries(
            intlStore.languages.map((x) => [x.code, x.name])
          )}
        />
      </div>
    </div>
  );
}
