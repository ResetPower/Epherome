import { TabBar, TabBarItem, TabBody, TabController } from "@resetpower/rcs";
import { MdDownload, MdInfo, MdPalette, MdTune } from "react-icons/md";
import { t, intlStore } from "../../intl";
import { observer } from "mobx-react-lite";
import { BiCube } from "react-icons/bi";
import SettingsGeneralFragment from "./GeneralFragment";
import SettingsDisplayFragment from "./DisplayFragment";
import SettingsAppearanceFragment from "./AppearanceFragment";
import SettingsDownloadFragment from "./DownloadFragment";
import SettingsAboutFragment from "./AboutFragment";

const SettingsPage = observer(() => {
  // visit the key to update on it changes
  intlStore.language;

  return (
    <TabController className="eph-h-full" orientation="vertical">
      <TabBar>
        <TabBarItem value={0}>
          <MdTune />
          {t("general")}
        </TabBarItem>
        <TabBarItem value={1}>
          <BiCube />
          {t("display")}
        </TabBarItem>
        <TabBarItem value={2}>
          <MdPalette />
          {t("appearance")}
        </TabBarItem>
        <TabBarItem value={3}>
          <MdDownload />
          {t("download")}
        </TabBarItem>
        <TabBarItem value={4}>
          <MdInfo />
          {t("about")}
        </TabBarItem>
      </TabBar>
      <TabBody className="overflow-y-auto">
        <SettingsGeneralFragment />
        <SettingsDisplayFragment />
        <SettingsAppearanceFragment />
        <SettingsDownloadFragment />
        <SettingsAboutFragment />
      </TabBody>
    </TabController>
  );
});

export default SettingsPage;
