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
import { EmptyProps, EphResponse } from "../tools/types";
import DownloadsPage from "../pages/DownloadsPage";
import GlobalOverlay from "./GlobalOverlay";
import Router from "../router/Router";
import Route from "../router/Route";
import { darkTheme, hist, lightTheme } from "../renderer/global";
import { applyTheme } from "../renderer/theme";
import { ephConfigs } from "../renderer/config";

export interface AppState {
  title: string;
}

export default class App extends Component<EmptyProps, AppState> {
  state: AppState = {
    title: resolveTitle(hist.pathname()),
  };
  constructor(props: EmptyProps) {
    super(props);
    applyTheme(ephConfigs.theme === "dark" ? darkTheme : lightTheme);
    // subscribe title change
    subscribe("hist", (pathname) => this.setState({ title: resolveTitle(pathname) }));
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
        <Router>
          <Route component={HomePage} path="/" />
          <Route component={AccountsPage} path="/accounts" />
          <Route component={ProfilesPage} path="/profiles" />
          <Route component={SettingsPage} path="/settings" />
          <Route component={DownloadsPage} path="/downloads" />
          <Route component={ProfileManagementPage} path="/profile" />
        </Router>
      </>
    );
  }
}
