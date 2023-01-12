import { Hyperlink, Info } from "@resetpower/rcs";
import { codeName, ephVersion, userDataPath } from "common/utils/info";
import { openInBrowser, openInFinder } from "common/utils/open";
import { Card } from "eph/components/layouts";
import { t } from "eph/intl";
import os from "os";
import EpheromeLogo from "assets/Epherome.png";

const SettingsAboutFragment = (): JSX.Element => (
  <div className="space-y-3">
    <Card className="flex items-center space-x-3">
      <img
        src={EpheromeLogo}
        alt="EpheromeLogo"
        className="w-16 h-16 select-none"
      />
      <div className="select-none">
        <p className="space-x-1 text-lg">
          <span className="font-medium">Epherome</span>
          <span>{codeName ?? ""}</span>
        </p>
        <p className="space-x-1 text-sm">
          <span>{t("version")}</span>
          <span>Beta {ephVersion}</span>
        </p>
      </div>
    </Card>
    <Card>
      <Info title={t("os")}>
        <div className="flex space-x-1">
          <p className="capitalize">{os.platform()}</p>
          <p>{os.arch()}</p>
          <p>{os.release()}</p>
        </div>
      </Info>
      <Info title={t("versionOfSomething", "Electron")}>
        {process.versions.electron}
      </Info>
      <Info title={t("versionOfSomething", "Chrome")}>
        {process.versions.chrome}
      </Info>
      <Info title={t("versionOfSomething", "Node.js")}>
        {process.versions.node}
      </Info>
      <Info title={t("versionOfSomething", "V8")}>{process.versions.v8}</Info>
      <Info title={t("settings.epheromePath")}>
        <Hyperlink onClick={() => openInFinder(userDataPath)}>
          {userDataPath}
        </Hyperlink>
      </Info>
    </Card>
    <Card>
      <p>
        {t("settings.officialSite")}
        <Hyperlink
          paddingX
          onClick={() => openInBrowser("https://epherome.com")}
        >
          https://epherome.com
        </Hyperlink>
      </p>
      <p>
        GitHub
        <Hyperlink
          paddingX
          onClick={() =>
            openInBrowser("https://github.com/ResetPower/Epherome")
          }
        >
          https://github.com/ResetPower/Epherome
        </Hyperlink>
      </p>
      <p>Copyright © 2021-2023 ResetPower.</p>
      <p>{t("settings.openSourceSoftware")} | GNU General Public License 3.0</p>
    </Card>
  </div>
);

export default SettingsAboutFragment;
