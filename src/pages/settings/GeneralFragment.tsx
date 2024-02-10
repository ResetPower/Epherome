import { tr, i18n } from "../../internationalize";
import Select from "../../components/Select";
import { cfg } from "../../stores/config";

export default function GeneralFragment() {
  return (
    <div>
      <div>
        <div>{tr.setting.displayLanguage}</div>
        <Select
          value={cfg.language}
          onChange={(v) => i18n.setLang(v)}
          options={Object.fromEntries(i18n.getNames().map((x) => [x, x]))}
        />
      </div>
    </div>
  );
}