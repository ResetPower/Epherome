import { useState } from "react";
import { IconContext } from "react-icons";
import { RouteName, routeMap } from "./router/map";
import { historyStore } from "./router";
import Sidebar from "./router/Sidebar";
import {
  MdAccountCircle,
  MdCalculate,
  MdGamepad,
  MdHome,
  MdSettings,
} from "react-icons/md";
import { tr } from "./internationalize";

function App() {
  const [route, setRoute] = useState<RouteName>("home");
  historyStore.subscribe(setRoute);

  return (
    <IconContext.Provider value={{ size: "1.3em" }}>
      <div className="flex h-full">
        <Sidebar
          items={[
            { path: "home", icon: <MdHome />, name: tr.sidebar.home },
            {
              path: "accounts",
              icon: <MdAccountCircle />,
              name: tr.sidebar.accounts,
            },
            { path: "profiles", icon: <MdGamepad />, name: tr.sidebar.profiles },
            { path: "counter", icon: <MdCalculate />, name: tr.sidebar.counter },
            {
              path: "settings",
              icon: <MdSettings />,
              name: tr.sidebar.settings,
            },
          ]}
        />
        {routeMap[route]}
      </div>
    </IconContext.Provider>
  );
}

export default App;
