import { Component } from "react";
import AppBar from "../components/AppBar";
import IconButton from "../components/IconButton";
import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/AccountsPage";
import ProfilesPage from "../pages/ProfilesPage";
import SettingsPage from "../pages/SettingsPage";
import { resolveTitle } from "./titles";
import ProfileManagementPage from "../pages/ProfileManagementPage";
import { broadcast, subscribe } from "./session";
import { EmptyObject, StringMap } from "../tools/types";
import DownloadsPage from "../pages/DownloadsPage";
import GlobalOverlay from "../components/GlobalOverlay";
import { Router } from "../router";
import { darkTheme, hist, lightTheme } from "./global";
import { applyTheme } from "./theme";
import { ephConfigs, setConfig } from "./config";
import { MdArrowBack } from "react-icons/md";
import { FaLayerGroup } from "react-icons/fa";
import { IconContext } from "react-icons/lib";
import { ipcRenderer } from "electron";

export interface AppState {
  title: string;
  mainClassName: string;
}

export default class App extends Component<EmptyObject, AppState> {
  state: AppState = {
    title: resolveTitle(hist.pathname()),
    mainClassName: "",
  };

  routes = [
    {
      path: "/",
      component: <HomePage />,
    },
    {
      path: "/accounts",
      component: <AccountsPage />,
    },
    { path: "/profiles", component: <ProfilesPage /> },
    { path: "/settings", component: <SettingsPage /> },
    { path: "/downloads", component: <DownloadsPage /> },
    {
      path: "/profile",
      component: (params: StringMap): JSX.Element => <ProfileManagementPage params={params} />,
    },
  ];

  media = window.matchMedia("(prefers-color-scheme: dark)");

  // set config according to system
  detectSystemTheme(): void {
    const prefersDarkMode = this.media.matches;
    setConfig(() => (ephConfigs.theme = prefersDarkMode ? "dark" : "light"));
  }

  updateTheme(): void {
    if (ephConfigs.themeFollowOs) {
      this.detectSystemTheme();
      this.media.addEventListener("change", () => {
        if (ephConfigs.themeFollowOs) {
          this.detectSystemTheme();
          broadcast("theme");
        }
      });
    }
    applyTheme(ephConfigs.theme === "dark" ? darkTheme : lightTheme);
  }

  quitApp(): void {
    ipcRenderer.send("quit");
  }

  constructor(props: EmptyObject) {
    super(props);
    this.updateTheme();
    subscribe("anm", () => {
      this.setState({
        mainClassName: "fade-enter",
      });
    });
    subscribe("hist", (pathname) => {
      this.setState({ title: resolveTitle(pathname), mainClassName: "fade-exit" });
    });
    subscribe("theme", () => {
      this.updateTheme();
      this.setState({});
    });
  }

  render(): JSX.Element {
    const isAtHome = this.state.title === "Epherome";
    return (
      <IconContext.Provider value={{ size: "1.5em" }}>
        <GlobalOverlay />
        <AppBar className="mb-2 eph-dragging-area">
          <IconButton
            className="text-white eph-non-dragging-area"
            onClick={
              isAtHome
                ? () => {
                    // do sth on click
                  }
                : hist.goBack
            }
          >
            {isAtHome ? <FaLayerGroup size="1.2rem" /> : <MdArrowBack />}
          </IconButton>
          <p className="flex-grow pl-3 select-none text-white text-xl">{this.state.title}</p>
        </AppBar>
        <div className={this.state.mainClassName}>
          <Router history={hist} routes={this.routes} />
        </div>
      </IconContext.Provider>
    );
  }
}
