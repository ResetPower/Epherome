import { MdWarning } from "react-icons/md";
import Link from "../../components/Link";
import { appVersion, dataDir, tauriVersion } from "../../stores/config";
import { tr } from "../../internationalize";

export default function AboutFragment() {
  return (
    <div>
      <div>Epherome {appVersion}</div>
      <div className="flex items-center">
        <MdWarning />
        <div>
          <p>{tr.about.nightlyWarning}</p>
          <p>{tr.about.issue}</p>
        </div>
      </div>
      <div>{tr.about.tauriVersion}: {tauriVersion}</div>
      <div>{tr.about.dataDir}: {dataDir}</div>
      <div>
        {tr.about.officialWebsite}: <Link to="https://epherome.com" />
      </div>
      <div>
        {tr.about.githubRepo}: <Link to="https://github.com/ResetPower/Epherome" />
      </div>
      <div>{tr.about.copyright}</div>
      <div>Open Source Software | GNU General Public License 3.0</div>
    </div>
  );
}
