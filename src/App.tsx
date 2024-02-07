import { useState } from "react";
import { IconContext } from "react-icons";
import { RouteName, routeMap } from "./router/map";
import { historyStore } from "./router";
import Sidebar from "./router/Sidebar";
import { MdAccountCircle, MdGamepad, MdHome, MdSettings } from "react-icons/md";

function App() {
  const [route, setRoute] = useState<RouteName>("home");
  historyStore.subscribe(setRoute);

  return (
    <IconContext.Provider value={{ size: "1.3em" }}>
      <div className="flex h-full">
        <Sidebar
          items={[
            { path: "home", icon: <MdHome />, name: "Home" },
            { path: "accounts", icon: <MdAccountCircle />, name: "Accounts" },
            { path: "profiles", icon: <MdGamepad />, name: "Profiles" },
            { path: "settings", icon: <MdSettings />, name: "Settings" },
          ]}
        />
        {routeMap[route]}
      </div>
    </IconContext.Provider>
  );
}

export default App;
