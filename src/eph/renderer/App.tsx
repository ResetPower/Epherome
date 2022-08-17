import HomePage from "../views/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/profile/ProfilesPage";
import SettingsPage, { UpdateAvailableDialog } from "../views/SettingsPage";
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
import { intlStore, KeyOfLanguageDefinition, t } from "../intl";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { useEffect, useMemo } from "react";
import { configStore } from "common/struct/config";
import { VscChromeMinimize, VscClose, VscDebugConsole } from "react-icons/vsc";
import ProfileInstallPage from "../views/profile/ProfileInstallPage";
import { ipcRenderer } from "electron";
import { historyStore } from "./history";
import { observer } from "mobx-react-lite";
import { GlobalOverlay } from "eph/overlay";
import JavaInstallPage from "eph/views/JavaInstallPage";
import { IconButton, AppBar, Menu, AppBarTitle } from "@resetpower/rcs";
import ModpackExportPage from "eph/views/ModpackExportPage";
import { checkEphUpdate } from "./updater";
import ExtensionStore from "eph/views/ExtensionStore";
import { BsPersonCircle, BsServer } from "react-icons/bs";
import LoginPage from "eph/views/LoginPage";
import PersonalCenterPage from "eph/views/PersonalCenterPage";
import { TaskPanelShower } from "eph/components/TaskPanel";
import { PersonalPanelShower } from "eph/components/PersonalPanel";
import ServerControlPage from "eph/views/ServerControlPage";

export const EphAppBar = observer(
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
        action: () => historyStore.push("accounts"),
      },
      {
        icon: <MdGamepad />,
        text: t("profiles"),
        action: () => historyStore.push("profiles"),
      },
      {
        icon: <MdViewCarousel />,
        text: t("processes"),
        action: () => historyStore.push("processes"),
      },
      {
        icon: <MdApps />,
        text: t("extensions"),
        action: () => historyStore.push("extensions"),
      },
      {
        icon: <BsServer />,
        text: t("serverControl"),
        action: () => historyStore.push("serverControl"),
      },
      {
        icon: <MdSettings />,
        text: t("settings"),
        action: () => historyStore.push("settings"),
      },
      {
        icon: <BsPersonCircle />,
        text: t("ephPersonalCenter"),
        action: () =>
          configStore.epheromeToken
            ? historyStore.push("ephPersonalCenter")
            : historyStore.push("ephLogin"),
      },
    ];

    return (
      <AppBar className={`${isTitleBarEph && "eph-drag"}`}>
        {isAtHome ? (
          <Menu padding={3} items={popMenuItems}>
            {(open) => (
              <IconButton active={open}>
                <MdMenu />
              </IconButton>
            )}
          </Menu>
        ) : (
          <div className="eph-no-drag flex">
            {!isAtHome && (
              <IconButton
                onClick={isAtHome ? undefined : () => historyStore.back()}
              >
                {<MdArrowBack />}
              </IconButton>
            )}
          </div>
        )}
        {isAtHome ? (
          <AppBarTitle>{title}</AppBarTitle>
        ) : (
          <div className="flex-grow">
            <Menu
              wrapperClassName="select-none pl-3 text-xl font-medium cursor-pointer"
              items={popMenuItems}
            >
              {title}
            </Menu>
          </div>
        )}
        <div className="eph-no-drag flex">
          <PersonalPanelShower />
          <TaskPanelShower />
          {configStore.developerMode && (
            <Menu
              padding={3}
              items={[
                {
                  icon: <VscDebugConsole />,
                  text: "Developer Tools",
                  action: () => ipcRenderer.send("open-devtools"),
                },
                {
                  icon: <MdRefresh />,
                  text: "Reload Epherome",
                  action: () => location.reload(),
                },
              ]}
            >
              {(open) => (
                <IconButton active={open}>
                  <MdDeveloperBoard />
                </IconButton>
              )}
            </Menu>
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
                    cancellable: true,
                    action: () => ipcRenderer.send("quit"),
                  })
                }
              >
                <VscClose />
              </IconButton>
            </>
          )}
        </div>
      </AppBar>
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
          <ProfilesPage params={params} />
        ) : pathname === "profile.install" ? (
          params ? (
            <ProfileInstallPage profile={configStore.profiles[+params]} />
          ) : (
            <div />
          )
        ) : pathname === "profile.exportModpack" ? (
          params ? (
            <ModpackExportPage profile={configStore.profiles[+params]} />
          ) : (
            <div />
          )
        ) : pathname === "settings" ? (
          <SettingsPage />
        ) : pathname === "extensions" ? (
          <ExtensionStore />
        ) : pathname === "download" ? (
          <DownloadsPage version={params ? JSON.parse(params) : undefined} />
        ) : pathname === "java.installJava" ? (
          <JavaInstallPage />
        ) : pathname === "processes" ? (
          <ProcessesPage />
        ) : pathname === "ephLogin" ? (
          <LoginPage />
        ) : pathname === "ephPersonalCenter" ? (
          <PersonalCenterPage />
        ) : pathname === "serverControl" ? (
          <ServerControlPage />
        ) : (
          <></>
        )}
      </CSSTransition>
    </SwitchTransition>
  );
}

const App = observer(() => {
  const { pathname, params } = historyStore.use;

  // response route change
  useEffect(() => {
    // check update automatic
    if (configStore.checkUpdate) {
      checkEphUpdate().then((result) => {
        if (result && result.need) {
          showOverlay({
            title: t("epheromeUpdate"),
            content: UpdateAvailableDialog,
            params: {
              version: result.name,
            },
          });
        }
      });
    }
  }, []);

  const pn = pathname as KeyOfLanguageDefinition;
  return (
    <IconContext.Provider value={{ size: "1.5em", className: "mx-0.5" }}>
      <GlobalOverlay />
      <EphAppBar pathname={pn} />
      <RouterView pathname={pn} params={decodeURIComponent(params)} />
    </IconContext.Provider>
  );
});

export default App;
