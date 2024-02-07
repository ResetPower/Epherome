import { MdWarning } from "react-icons/md";
import Link from "../../components/Link";
import { appVersion, dataDir, tauriVersion } from "../../stores/config";

export default function AboutFragment() {
  return (
    <div>
      <div>Epherome {appVersion}</div>
      <div className="flex items-center">
        <MdWarning />
        <div>
          <p>Nighly versions are extremely unstable.</p>
          <p>Go to GitHub Issues to ask questions or make suggestions.</p>
        </div>
      </div>
      <div>Tauri Version: {tauriVersion}</div>
      <div>Data Dir: {dataDir}</div>
      <div>
        Official Website: <Link to="https://epherome.com" />
      </div>
      <div>
        GitHub Homepage: <Link to="https://github.com/ResetPower/Epherome" />
      </div>
      <div>Copyright (C) 2021-2024 ResetPower.</div>
      <div>Open Source Software | GNU General Public License 3.0</div>
    </div>
  );
}
