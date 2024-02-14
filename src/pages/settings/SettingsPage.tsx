import { useState } from "react";
import TabBar from "../../components/TabBar";
import AboutFragment from "./AboutFragment";
import GeneralFragment from "./GeneralFragment";
import AppearanceFragment from "./AppearanceFragment";
import DownloadFragment from "./DownloadFragment";
import { t } from "../../intl";

export default function SettingsPage() {
  const [value, setValue] = useState(0);

  return (
    <div className="w-full h-full">
      <TabBar
        tabs={[
          t.general,
          t.settings.appearance,
          t.settings.download,
          t.settings.about,
        ]}
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
