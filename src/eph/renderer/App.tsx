import HomePage from "../views/home/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/profile/ProfilesPage";
import UpdateAvailableDialog from "../views/settings/UpdateAvailableDialog";
import DownloadsPage from "../views/DownloadsPage";
import { showOverlay } from "../overlay";
import {
  MdAccountCircle,
  MdApps,
  MdArrowBack,
  MdDeveloperBoard,
  MdGamepad,
  MdMenu,
  MdNotificationAdd,
  MdRefresh,
  MdSettings,
  MdStore,
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
import {
  IconButton,
  AppBar,
  Menu,
  AppBarTitle,
  MenuItem,
} from "@resetpower/rcs";
import ModpackExportPage from "eph/views/ModpackExportPage";
import { checkEphUpdate } from "./updater";
import ExtensionStore from "eph/views/ExtensionStore";
import { BsPersonCircle, BsServer } from "react-icons/bs";
import LoginPage from "eph/views/LoginPage";
import PersonalCenterPage from "eph/views/PersonalCenterPage";
import { TaskPanelShower } from "eph/components/TaskPanel";
import { PersonalPanelShower } from "eph/components/PersonalPanel";
import ServerControlPage from "eph/views/ServerControlPage";
import { personalStore } from "common/stores/personal";
import Marketplace from "eph/views/Marketplace";
import { adapt } from "common/utils";
import SettingsPage from "eph/views/settings/SettingsPage";
import { NotificationPanelShower } from "eph/components/NotificationPanel";
import { notificationStore } from "common/stores/notification";

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

    const popMenuItems: MenuItem[] = [
      ...Object.entries({
        accounts: <MdAccountCircle />,
        profiles: <MdGamepad />,
        processes: <MdViewCarousel />,
        extensions: <MdApps />,
        marketplace: <MdStore />,
        serverControl: <BsServer />,
        settings: <MdSettings />,
      }).map((value) => ({
        icon: value[1],
        text: t(value[0] as KeyOfLanguageDefinition),
        action: () => historyStore.push(value[0] as KeyOfLanguageDefinition),
        active: historyStore.current === value[0],
      })),
      {
        icon: <BsPersonCircle />,
        text: t("ephPersonalCenter"),
        action: () =>
          personalStore.userInfo
            ? historyStore.push("ephPersonalCenter")
            : historyStore.push("ephLogin"),
        active: adapt(historyStore.current, "ephPersonalCenter", "ephLogin"),
      },
    ];

    return (
      <AppBar className={`${isTitleBarEph && "eph-drag"}`}>
        {isAtHome ? (
          <Menu wrapperClassName="eph-no-drag" padding={3} items={popMenuItems}>
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
          <NotificationPanelShower />
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
                {
                  icon: <MdNotificationAdd />,
                  text: "Send Notification",
                  action: () =>
                    notificationStore.push({
                      type: "info",
                      message: "Hello, World!",
                      source: "Epherome Developer Tools",
                    }),
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
        ) : pathname === "marketplace" ? (
          <Marketplace />
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
