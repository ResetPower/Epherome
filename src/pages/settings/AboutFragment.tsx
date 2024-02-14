import { MdWarning } from "react-icons/md";
import Link from "../../components/Link";
import { t } from "../../intl";
import { meta } from "../../stores";
import Info from "../../components/Info";

export default function AboutFragment() {
  return (
    <div className="p-3">
      <div className="m-1">Epherome {meta.appVersion}</div>
      <div className="flex items-center space-x-2 rounded bg-red-100 p-3">
        <MdWarning className="text-xl text-red-500" />
        <pre className="text-sm">{t.settings.warning}</pre>
      </div>
      <Info name="Operating System">
        {meta.osPlatform}-{meta.osVersion}
      </Info>
      <Info name={t.settings.tauriVersion}>{meta.tauriVersion}</Info>
      <Info copyable={meta.appDataDir} code name={t.settings.dataDir}>
        {meta.appDataDir}
      </Info>
      <Info name={t.settings.officialSite}>
        <Link to="https://epherome.com" />
      </Info>
      <Info name={t.settings.githubHomepage}>
        <Link to="https://github.com/ResetPower/Epherome" />
      </Info>
      <div className="text-sm text-center">
        <div>Copyright &copy; 2021-2024 ResetPower.</div>
        <div>{t.settings.oss} | GNU General Public License 3.0</div>
      </div>
    </div>
  );
}
