import { Component } from "react";
import AppBar from "../components/AppBar";
import Icon from "../components/Icon";
import IconButton from "../components/IconButton";
import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/AccountsPage";
import ProfilesPage from "../pages/ProfilesPage";
import SettingsPage from "../pages/SettingsPage";
import { resolveTitle } from "../renderer/titles";
import ProfileManagementPage from "../pages/ProfileManagementPage";
import { subscribe } from "../renderer/session";
import { EmptyProps } from "../tools/types";
import DownloadsPage from "../pages/DownloadsPage";
import GlobalOverlay from "./GlobalOverlay";
import { Route, Router } from "../tools/router";
import { darkTheme, hist, lightTheme } from "../renderer/global";
import { applyTheme } from "../renderer/theme";
import { ephConfigs } from "../renderer/config";

export interface AppState {
  title: string;
  mainClassName: string;
}

export default class App extends Component<EmptyProps, AppState> {
  state: AppState = {
    title: resolveTitle(hist.pathname()),
    mainClassName: "",
  };
  constructor(props: EmptyProps) {
    super(props);
    applyTheme(ephConfigs.theme === "dark" ? darkTheme : lightTheme);
    // subscribe animation start
    subscribe("anm", () => {
      this.setState({
        mainClassName: "fade-enter",
      });
    });
    // subscribe title change
    subscribe("hist", (pathname) => {
      this.setState({ title: resolveTitle(pathname), mainClassName: "fade-exit" });
    });
    // subscribe theme change
    subscribe("theme", () => {
      applyTheme(ephConfigs.theme === "dark" ? darkTheme : lightTheme);
      this.setState({});
    });
  }
  render(): JSX.Element {
    return (
      <>
        <GlobalOverlay />
        <AppBar className="px-3 mb-2">
          <IconButton className="text-white" onClick={hist.goBack}>
            <Icon>{this.state.title === "Epherome" ? "menu" : "arrow_back"}</Icon>
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
