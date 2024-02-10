import { MdWarning } from "react-icons/md";
import Link from "../../components/Link";
import { appVersion, dataDir, tauriVersion } from "../../stores/config";
import { t } from "../../intl";

export default function AboutFragment() {
  return (
    <div>
      <div>Epherome {appVersion}</div>
      <div className="flex items-center space-x-2">
        <MdWarning className="text-2xl text-red-500" />
        <pre>{t.settings.warning}</pre>
      </div>
      <div>
        {t.settings.tauriVersion}: {tauriVersion}
      </div>
      <div>
        {t.settings.dataDir}: {dataDir}
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
