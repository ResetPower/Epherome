import HomePage from "../views/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/ProfilesPage";
import SettingsPage from "../views/SettingsPage";
import { Accessible, StringMap, unwrapAccessible } from "../tools";
import DownloadsPage from "../views/DownloadsPage";
import { GlobalOverlay } from "./overlays";
import { historyStore } from "./history";
import { themeStore } from "./theme";
import { MdArrowBack, MdMenu } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import { unwrapFunction } from "../tools";
import ProcessesPage from "../views/ProcessesPage";
import ExtensionsPage from "../views/ExtensionsPage";
import { IconButton } from "../components/inputs";
import { t } from "../intl";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { observer } from "mobx-react";
import { useLayoutEffect } from "react";

export interface RouteList {
  [key: string]: {
    component: Accessible<JSX.Element, [StringMap]>;
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
  extensions: {
    component: <ExtensionsPage />,
    title: (): string => t("extensions"),
  },
};

export const AppBar = observer(() => {
  // visit the key in order to update title on language change correctly
  historyStore.key;
  const route = routes[historyStore.pathname];
  const title = unwrapAccessible(route?.title);
  const isAtHome = title === "Epherome";
  return (
    <div className="eph-appbar">
      <IconButton
        className="text-white"
        onClick={isAtHome ? unwrapFunction() : historyStore.back}
      >
        {isAtHome ? <MdMenu /> : <MdArrowBack />}
      </IconButton>
      <p className="eph-appbar-title">{title}</p>
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
