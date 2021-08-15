import HomePage from "../views/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/ProfilesPage";
import SettingsPage from "../views/SettingsPage";
import { Accessible, unwrapAccessible } from "../tools";
import DownloadsPage from "../views/DownloadsPage";
import { GlobalOverlay } from "./overlays";
import { historyStore, LocationParams } from "./history";
import { themeStore } from "./theme";
import { MdArrowBack, MdDeveloperBoard, MdMenu } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import { unwrapFunction } from "../tools";
import ProcessesPage from "../views/ProcessesPage";
import { IconButton } from "../components/inputs";
import { t } from "../intl";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { observer } from "mobx-react";
import { useLayoutEffect } from "react";
import { configStore } from "../struct/config";
import Popover from "../components/Popover";
import { ListItem } from "../components/lists";
import { VscDebugConsole } from "react-icons/vsc";
import { ipcRenderer } from "electron";

export interface RouteList {
  [key: string]: {
    component: Accessible<JSX.Element, [LocationParams]>;
    title: Accessible<string>;
  };
}

const routes: RouteList = {
  home: {
    component: <HomePage />,
    title: (): string => t("epherome"),
  },
  accounts: {
    component: <AccountsPage />,
    title: (): string => t("accounts"),
  },
  profiles: {
    component: <ProfilesPage />,
    title: (): string => t("profiles"),
  },
  settings: {
    component: <SettingsPage />,
    title: (): string => t("settings"),
  },
  downloads: {
    component: <DownloadsPage />,
    title: (): string => t("download"),
  },
  processes: {
    component: <ProcessesPage />,
    title: (): string => t("processes"),
  },
};

export const AppBar = observer(() => {
  // visit the key in order to update title on language change correctly
  historyStore.key;
  const route = routes[historyStore.pathname];
  const title = unwrapAccessible(route?.title);
  const isAtHome = title === "Epherome";
  return (
    <div className="eph-appbar text-white">
      <IconButton onClick={isAtHome ? unwrapFunction() : historyStore.back}>
        {isAtHome ? <MdMenu /> : <MdArrowBack />}
      </IconButton>
      <p className="eph-appbar-title flex-grow">{title}</p>
      {configStore.developerMode && (
        <Popover
          className="text-contrast p-2"
          popover={
            <ListItem
              className="rounded-lg bg-blue-500"
              onClick={() => ipcRenderer.send("open-devtools")}
            >
              <VscDebugConsole /> Developer Tools
            </ListItem>
          }
        >
          <IconButton>
            <MdDeveloperBoard />
          </IconButton>
        </Popover>
      )}
    </div>
  );
});

export const RouterView = observer(() => {
  const route = routes[historyStore.pathname];
  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={historyStore.current?.pathname}
        timeout={120}
        classNames="fade"
      >
        {unwrapAccessible(
          route?.component,
          historyStore.current?.params ?? {}
        ) ?? <></>}
      </CSSTransition>
    </SwitchTransition>
  );
});

export default function App(): JSX.Element {
  useLayoutEffect(() => {
    themeStore.updateTheme();
    historyStore.isEmpty && historyStore.push("home");
  }, []);
  return (
    <IconContext.Provider value={{ size: "1.5em" }}>
      <GlobalOverlay />
      <AppBar />
      <RouterView />
    </IconContext.Provider>
  );
}
