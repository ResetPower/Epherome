import { useState } from "react";
import { IconContext } from "react-icons";
import { RouteName, routeMap } from "./router/map";
import { historyStore } from "./router";
import Sidebar from "./router/Sidebar";
import {
  MdAccountCircle,
  MdCalculate,
  MdHome,
  MdSettings,
} from "react-icons/md";
import { intlStore, t } from "./intl";
import { useForceUpdate } from "./utils";
import { IoLogoGameControllerA } from "react-icons/io";
import ToastWrapper from "./components/ToastWrapper";

function App() {
  const forceUpdate = useForceUpdate();
  const [route, setRoute] = useState<RouteName>("home");
  historyStore.subscribe(setRoute);
  intlStore.subscribe(forceUpdate);

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
            {
              path: "instances",
              icon: <IoLogoGameControllerA />,
              name: t.sidebar.instances,
            },
            { path: "counter", icon: <MdCalculate />, name: t.sidebar.counter },
            {
              path: "settings",
              icon: <MdSettings />,
              name: t.sidebar.settings,
            },
          ]}
        />
        {routeMap[route]()}
        <ToastWrapper />
      </div>
    </IconContext.Provider>
  );
}

export default App;
