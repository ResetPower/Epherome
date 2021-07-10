import { Component } from "react";
import AppBar from "../components/AppBar";
import Icon from "../components/Icon";
import IconButton from "../components/IconButton";
import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/AccountsPage";
import ProfilesPage from "../pages/ProfilesPage";
import SettingsPage from "../pages/SettingsPage";
import { resolveTitle } from "./titles";
import ProfileManagementPage from "../pages/ProfileManagementPage";
import { broadcast, subscribe } from "./session";
import { EmptyProps } from "../tools/types";
import DownloadsPage from "../pages/DownloadsPage";
import GlobalOverlay from "../components/GlobalOverlay";
import { Route, Router } from "../tools/router";
import { darkTheme, hist, lightTheme } from "./global";
import { applyTheme } from "./theme";
import { ephConfigs, setConfig } from "./config";

export interface AppState {
  title: string;
  mainClassName: string;
}

export default class App extends Component<EmptyProps, AppState> {
  state: AppState = {
    title: resolveTitle(hist.pathname()),
    mainClassName: "",
  };
  media = window.matchMedia("(prefers-color-scheme: dark)");
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
  constructor(props: EmptyProps) {
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
      <>
        <GlobalOverlay />
        <AppBar className="px-3 mb-2">
          <IconButton
            className="text-white"
            onClick={
              isAtHome
                ? () => {
                    // do sth
                  }
                : hist.goBack
            }
          >
            <Icon>{isAtHome ? "menu" : "arrow_back"}</Icon>
          </IconButton>
          <p className="flex-grow pl-3 select-none text-white text-xl">{this.state.title}</p>
        </AppBar>
        <div className={this.state.mainClassName}>
          <Router history={hist}>
            <Route component={<HomePage />} path="/" />
            <Route component={<AccountsPage />} path="/accounts" />
            <Route component={<ProfilesPage />} path="/profiles" />
            <Route component={<SettingsPage />} path="/settings" />
            <Route component={<DownloadsPage />} path="/downloads" />
            <Route
              component={(params) => <ProfileManagementPage params={params} />}
              path="/profile"
            />
          </Router>
        </div>
      </>
    );
  }
}
