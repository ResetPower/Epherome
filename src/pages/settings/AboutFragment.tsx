import { MdWarning } from "react-icons/md";
import Link from "../../components/Link";
import { t } from "../../intl";
import { meta } from "../../stores";

export default function AboutFragment() {
  return (
    <div>
      <div>Epherome {meta.appVersion}</div>
      <div className="flex items-center space-x-2">
        <MdWarning className="text-2xl text-red-500" />
        <pre>{t.settings.warning}</pre>
      </div>
      <div>
        {t.settings.tauriVersion}: {meta.tauriVersion}
      </div>
      <div>
        {t.settings.dataDir}: {meta.appDataDir}
      </div>
      <div>
        {t.settings.officialSite}: <Link to="https://epherome.com" />
      </div>
      <div>
        {t.settings.githubHomepage}:{" "}
        <Link to="https://github.com/ResetPower/Epherome" />
      </div>
      <div>Copyright (C) 2021-2024 ResetPower.</div>
      <div>{t.settings.oss} | GNU General Public License 3.0</div>
    </div>
  );
}
