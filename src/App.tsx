import { useState } from "react";
import CounterPage from "./pages/CounterPage";
import HomePage from "./pages/HomePage";
import Sidebar from "./components/Sidebar";
import { IoApps } from "react-icons/io5";
import { SiWolfram } from "react-icons/si";
import { MdAccountCircle, MdGamepad, MdSettings } from "react-icons/md";
import SettingsPage from "./pages/settings/SettingsPage";
import { IconContext } from "react-icons";
import AccountsPage from "./pages/accounts/AccountsPage";
import ProfilesPage from "./pages/profiles/ProfilesPage";

// Format: [Icon, Page]
// If the icon is undefined, then the page won't be displayed in the sidebar.
const routeMap = {
  home: [<IoApps />, <HomePage />],
  accounts: [<MdAccountCircle />, <AccountsPage />],
  profiles: [<MdGamepad />, <ProfilesPage />],
  counter: [<SiWolfram />, <CounterPage />],
  settings: [<MdSettings />, <SettingsPage />],
};

export type Route = keyof typeof routeMap;

function App() {
  const [route, setRoute] = useState<Route>("home");

  return (
    <IconContext.Provider value={{ size: "1.3em" }}>
      <div className="flex h-full">
        <Sidebar route={route} routeMap={routeMap} setRoute={setRoute} />
        {routeMap[route][1]}
      </div>
    </IconContext.Provider>
  );
}

export default App;
