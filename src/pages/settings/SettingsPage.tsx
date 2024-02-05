import { useState } from "react";
import TabBar from "../../components/TabBar";
import AboutFragment from "./AboutFragment";
import GeneralFragment from "./GeneralFragment";
import AppearanceFragment from "./AppearanceFragment";
import DownloadFragment from "./DownloadFragment";

export default function SettingsPage() {
  const [value, setValue] = useState(0);

  return (
    <div className="w-full">
      <TabBar
        tabs={["General", "Appearance", "Download", "About"]}
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
