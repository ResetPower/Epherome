import { useState } from "react";
import TabBar from "../../components/TabBar";
import AboutFragment from "./AboutFragment";
import GeneralFragment from "./GeneralFragment";
import AppearanceFragment from "./AppearanceFragment";
import DownloadFragment from "./DownloadFragment";
import { tr } from "../../internationalize"

export default function SettingsPage() {
  const [value, setValue] = useState(0);

  return (
    <div className="w-full">
      <TabBar
        tabs={[tr.setting.general, tr.setting.appearance, tr.setting.download, tr.setting.about]}
        value={value}
        setValue={setValue}
      />
      {
        [
          <GeneralFragment />,
          <AppearanceFragment />,
          <DownloadFragment />,
          <AboutFragment />,
        ][value]
      }
    </div>
  );
}
