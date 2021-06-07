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
import Router from "../router/Router";
import Route from "../router/Route";
import { hist } from "../renderer/global";

export interface AppState {
  title: string;
}

export default class App extends Component<EmptyProps, AppState> {
  state: AppState = {
    title: resolveTitle(hist.pathname()),
  };
  constructor(props: EmptyProps) {
    super(props);
    hist.listen((location) => {
      this.setState({
        title: resolveTitle(location.pathname),
      });
    });
    subscribe("theme", () => this.setState({}));
  }
  render(): JSX.Element {
    return (
      <>
        <GlobalOverlay />
        <AppBar>
          <IconButton onClick={hist.goBack}>
            <Icon>{this.state.title === "Epherome" ? "menu" : "arrow_back"}</Icon>
          </IconButton>
          <p className="flex-grow pl-4 select-none text-white text-xl">{this.state.title}</p>
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
