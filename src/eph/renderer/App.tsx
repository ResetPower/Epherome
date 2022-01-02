import HomePage from "../views/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/ProfilesPage";
import SettingsPage from "../views/SettingsPage";
import DownloadsPage from "../views/DownloadsPage";
import { showOverlay } from "../overlay";
import {
  MdAccountCircle,
  MdApps,
  MdArrowBack,
  MdDeveloperBoard,
  MdGamepad,
  MdMenu,
  MdRefresh,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";
import { IconContext } from "react-icons/lib";
import ProcessesPage from "../views/ProcessesPage";
import { IconButton } from "../components/inputs";
import { intlStore, KeyOfLanguageDefinition, t } from "../intl";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useEffect, useMemo, useState } from "react";
import { configStore } from "common/struct/config";
import { VscChromeMinimize, VscClose, VscDebugConsole } from "react-icons/vsc";
import Popover from "../components/Popover";
import ProfileInstallPage from "../views/ProfileInstallPage";
import PopMenu from "eph/components/PopMenu";
import { ipcRenderer } from "electron";
import { pushToHistory } from "./history";
import { observer } from "mobx-react-lite";
import { GlobalOverlay } from "eph/overlay";
import ExtensionView from "eph/views/ExtensionView";

export const AppBar = observer(
  (props: { pathname: KeyOfLanguageDefinition }) => {
    // visit the key
    // in order to update title on language change correctly
    intlStore.language;
    // keep title bar style
    const isTitleBarEph = useMemo(
      () => configStore.titleBarStyle === "eph",
      []
    );
    const title = t(props.pathname);
    const isAtHome = props.pathname === "home";

    const popMenuItems = [
      {
        icon: <MdAccountCircle />,
        text: t("accounts"),
        onClick: () => pushToHistory("accounts"),
      },
      {
        icon: <MdGamepad />,
        text: t("profiles"),
        onClick: () => pushToHistory("profiles"),
      },
      {
        icon: <MdViewCarousel />,
        text: t("processes"),
        onClick: () => pushToHistory("processes"),
      },
      {
        icon: <MdApps />,
        text: t("extensions"),
        onClick: () =>
          showOverlay({
            type: "sheet",
            title: t("extensions"),
            content: ExtensionView,
          }),
      },
      {
        icon: <MdSettings />,
        text: t("settings"),
        onClick: () => pushToHistory("settings"),
      },
    ];

    return (
      <div className={`eph-appbar text-white ${isTitleBarEph && "eph-drag"}`}>
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
              <PopMenu items={popMenuItems} />
            </Popover>
          ) : (
            <IconButton onClick={isAtHome ? undefined : () => history.back()}>
              {<MdArrowBack />}
            </IconButton>
          )}
        </div>
        <p className="eph-appbar-title flex-grow">{title}</p>
        <div className="eph-no-drag flex">
          {configStore.developerMode && (
            <Popover
              className="bg-card rounded-lg p-2 shadow-lg text-contrast eph-no-drag"
              button={(trigger, active) => (
                <IconButton onClick={trigger} active={active}>
                  <MdDeveloperBoard />
                </IconButton>
              )}
            >
              <PopMenu
                items={[
                  {
                    icon: <VscDebugConsole />,
                    text: "Developer Tools",
                    onClick: () => ipcRenderer.send("open-devtools"),
                  },
                  {
                    icon: <MdRefresh />,
                    text: "Reload Epherome",
                    onClick: () => location.reload(),
                  },
                ]}
              />
            </Popover>
          )}
          {isTitleBarEph && (
            <>
              <IconButton onClick={() => ipcRenderer.send("minimize")}>
                <VscChromeMinimize />
              </IconButton>
              <IconButton
                onClick={() =>
                  showOverlay({
                    title: t("warning"),
                    message: t("confirmQuitting"),
                    action: () => ipcRenderer.send("quit"),
                  })
                }
              >
                <VscClose />
              </IconButton>
            </>
          )}
        </div>
      </div>
    );
  }
);

export function RouterView({
  pathname,
  params,
}: {
  pathname: KeyOfLanguageDefinition;
  params: string;
}) {
  return (
    <SwitchTransition mode="out-in">
      <CSSTransition key={pathname} timeout={120} classNames="fade">
        {pathname === "home" ? (
          <HomePage />
        ) : pathname === "accounts" ? (
          <AccountsPage />
        ) : pathname === "profiles" ? (
          <ProfilesPage />
        ) : pathname === "profile.install" ? (
          params ? (
            <ProfileInstallPage profile={configStore.profiles[+params]} />
          ) : (
            <div />
          )
        ) : pathname === "settings" ? (
          <SettingsPage />
        ) : pathname === "download" ? (
          <DownloadsPage />
        ) : pathname === "processes" ? (
          <ProcessesPage />
        ) : (
          <></>
        )}
      </CSSTransition>
    </SwitchTransition>
  );
}

export default function App(): JSX.Element {
  const [route, setRoute] = useState("home");
  const i = route.indexOf("?");
  const [pathname, params] =
    i === -1 ? [route, ""] : [route.slice(0, i), route.slice(i + 1)];

  // response route change
  useEffect(
    () =>
      window.addEventListener("hashchange", () => {
        const hash = location.hash.slice(1);
        setRoute(hash === "" ? "home" : hash);
      }),
    []
  );

  const pn = pathname as KeyOfLanguageDefinition;
  return (
    <IconContext.Provider value={{ size: "1.5em", className: "mx-0.5" }}>
      <GlobalOverlay />
      <AppBar pathname={pn} />
      <RouterView pathname={pn} params={params} />
    </IconContext.Provider>
  );
}
