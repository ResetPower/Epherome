import Select from "../../components/Select";
import { languages, t, updateLanguage } from "../../intl";
import { cfg } from "../../stores/config";

export default function GeneralFragment() {
  return (
    <div>
      <div>
        <div>{t.settings.displayLanguage}</div>
        <Select
          value={cfg.language}
          onChange={updateLanguage}
          options={Object.fromEntries(languages.map((x) => [x.code, x.name]))}
        />
      </div>
    </div>
  );
}
