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
import { t } from "./intl";

function App() {
  const [route, setRoute] = useState<RouteName>("home");
  historyStore.subscribe(setRoute);

  return (
    <IconContext.Provider value={{ size: "1.3em" }}>
      <div className="flex h-full">
        <Sidebar
          items={[
            { path: "home", icon: <MdHome />, name: t.sidebar.home },
            {
              path: "accounts",
              icon: <MdAccountCircle />,
              name: t.sidebar.accounts,
            },
            { path: "profiles", icon: <MdGamepad />, name: t.sidebar.profiles },
            { path: "counter", icon: <MdCalculate />, name: t.sidebar.counter },
            {
              path: "settings",
              icon: <MdSettings />,
              name: t.sidebar.settings,
            },
          ]}
        />
        {routeMap[route]}
      </div>
    </IconContext.Provider>
  );
}

export default App;
