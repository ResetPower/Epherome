import HomePage from "../views/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/ProfilesPage";
import SettingsPage from "../views/SettingsPage";
import { Accessible, unwrapAccessible } from "common/utils";
import DownloadsPage from "../views/DownloadsPage";
import { GlobalOverlay, showOverlay } from "./overlays";
import { historyStore, LocationParams } from "./history";
import {
  MdAccountCircle,
  MdApps,
  MdArrowBack,
  MdDeveloperBoard,
  MdGamepad,
  MdMenu,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";
import { IconContext } from "react-icons/lib";
import ProcessesPage from "../views/ProcessesPage";
import { IconButton } from "../components/inputs";
import { intlStore, t } from "../intl";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { observer } from "mobx-react";
import { useLayoutEffect } from "react";
import { configStore } from "common/struct/config";
import {
  VscChromeMinimize,
  VscClose,
  VscDebugConsole,
  VscExtensions,
} from "react-icons/vsc";
import { ipcRenderer } from "electron";
import Popover from "../components/Popover";
import { ListItem } from "../components/lists";
import ProfileInstallPage from "../views/ProfileInstallPage";
import { MinecraftProfile } from "common/struct/profiles";
import ExtensionsView from "eph/views/ExtensionsView";
import { ConfirmDialog } from "eph/components/Dialog";

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
        <div />
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
  intlStore.language;
  const route = routes[historyStore.pathname];
  const title = unwrapAccessible(route?.title);
  const isAtHome = title === "Epherome";

  return (
    <div className="eph-appbar text-white eph-drag">
      <div className="eph-no-drag">
        {isAtHome ? (
          <Popover
            className="bg-card rounded-lg p-2 shadow-xl text-contrast"
            dock="left"
            button={(trigger, active) => (
              <IconButton onClick={trigger} active={active}>
                <MdMenu />
              </IconButton>
            )}
          >
            {[
              {
                icon: <MdAccountCircle />,
                text: t("accounts"),
                click: () => historyStore.push("accounts"),
              },
              {
                icon: <MdGamepad />,
                text: t("profiles"),
                click: () => historyStore.push("profiles"),
              },
              {
                icon: <MdViewCarousel />,
                text: t("processes"),
                click: () => historyStore.push("processes"),
              },
              {
                icon: <MdApps />,
                text: t("extensions"),
                click: () => showOverlay(<ExtensionsView />, "sheet", "slide"),
              },
              {
                icon: <MdSettings />,
                text: t("settings"),
                click: () => historyStore.push("settings"),
              },
            ].map((val, index) => (
              <ListItem
                className={`rounded-lg p-2 px-3 bg-blue-600 bg-opacity-0 hover:bg-opacity-30 active:bg-opacity-50`}
                key={index}
                onClick={val.click}
              >
                {val.icon} {val.text}
              </ListItem>
            ))}
          </Popover>
        ) : (
          <IconButton onClick={isAtHome ? undefined : historyStore.back}>
            {<MdArrowBack />}
          </IconButton>
        )}
      </div>
      <p className="eph-appbar-title flex-grow">{title}</p>
      {configStore.developerMode && (
        <Popover
          className="bg-card rounded-lg p-2 shadow-lg text-contrast eph-no-drag"
          button={(trigger, active) => (
            <IconButton onClick={trigger} active={active}>
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
      {configStore.titleBarStyle === "eph" && (
        <>
          <IconButton onClick={() => ipcRenderer.send("minimize")}>
            <VscChromeMinimize />
          </IconButton>
          <IconButton
            onClick={() =>
              showOverlay(
                <ConfirmDialog
                  title={t("warning")}
                  message={t("confirmQuitting")}
                  action={() => ipcRenderer.send("quit")}
                />
              )
            }
          >
            <VscClose />
          </IconButton>
        </>
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
