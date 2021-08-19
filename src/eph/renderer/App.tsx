import HomePage from "../views/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/ProfilesPage";
import SettingsPage from "../views/SettingsPage";
import { Accessible, unwrapAccessible } from "common/utils";
import DownloadsPage from "../views/DownloadsPage";
import { GlobalOverlay } from "./overlays";
import { historyStore, LocationParams } from "./history";
import { themeStore } from "./theme";
import { MdArrowBack, MdDeveloperBoard, MdMenu } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import ProcessesPage from "../views/ProcessesPage";
import { IconButton } from "../components/inputs";
import { t } from "../intl";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { observer } from "mobx-react";
import { useLayoutEffect } from "react";
import { configStore } from "common/struct/config";
import { VscDebugConsole, VscExtensions } from "react-icons/vsc";
import { ipcRenderer } from "electron";
import Popover from "../components/Popover";
import { ListItem } from "../components/lists";
import ProfileInstallPage from "../views/ProfileInstallPage";
import { MinecraftProfile } from "common/struct/profiles";

export interface RouteList {
  [key: string]: {
    component: Accessible<JSX.Element, [LocationParams]>;
    title: Accessible<string>;
  };
}

const routes: RouteList = {
  home: {
    component: <HomePage />,
    title: () => t("epherome"),
  },
  accounts: {
    component: <AccountsPage />,
    title: () => t("accounts"),
  },
  profiles: {
    component: <ProfilesPage />,
    title: () => t("profiles"),
  },
  "profiles/install": {
    component: (params) =>
      params.profile ? (
        <ProfileInstallPage profile={params.profile as MinecraftProfile} />
      ) : (
        <div></div>
      ),
    title: () => t("profile.install"),
  },
  settings: {
    component: <SettingsPage />,
    title: () => t("settings"),
  },
  downloads: {
    component: <DownloadsPage />,
    title: () => t("download"),
  },
  processes: {
    component: <ProcessesPage />,
    title: () => t("processes"),
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
      <IconButton onClick={isAtHome ? undefined : historyStore.back}>
        {isAtHome ? <MdMenu /> : <MdArrowBack />}
      </IconButton>

      <p className="eph-appbar-title flex-grow">{title}</p>
      {configStore.developerMode && (
        <Popover
          className="bg-card rounded-lg p-2 shadow-lg text-contrast"
          button={(trigger) => (
            <IconButton onClick={trigger}>
              <MdDeveloperBoard />
            </IconButton>
          )}
        >
          {[
            {
              icon: <VscDebugConsole />,
              text: "Developer Tools",
              click: () => ipcRenderer.send("open-devtools"),
            },
            {
              icon: <VscExtensions />,
              text: "Extensions",
              click: () => {
                /**/
              },
            },
          ].map((val, index) => (
            <ListItem
              className="rounded-lg p-2 bg-blue-600 bg-opacity-0 hover:bg-opacity-30 active:bg-opacity-50"
              key={index}
              onClick={val.click}
            >
              {val.icon} {val.text}
            </ListItem>
          ))}
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
    <IconContext.Provider value={{ size: "1.5em", className: "mx-0.5" }}>
      <GlobalOverlay />
      <AppBar />
      <RouterView />
    </IconContext.Provider>
  );
}
