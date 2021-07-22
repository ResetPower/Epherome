import { Component } from "react";
import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/AccountsPage";
import ProfilesPage from "../pages/ProfilesPage";
import SettingsPage from "../pages/SettingsPage";
import { EmptyObject } from "../tools/types";
import DownloadsPage from "../pages/DownloadsPage";
import GlobalOverlay from "../components/GlobalOverlay";
import { Router } from "../tools/router";
import { hist, t } from "./global";
import { updateTheme } from "./theme";
import { MdArrowBack, MdMenu } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import { ipcRenderer } from "electron";
import { initRequiredFunction, unwrapFunction } from "../tools";
import ProcessesPage from "../pages/ProcessesPage";
import ExtensionsPage from "../pages/ExtensionsPage";
import { IconButton } from "../components/inputs";

export interface AppState {
  title: string;
}

export default class App extends Component<EmptyObject, AppState> {
  static updateUI = initRequiredFunction();

  state: AppState = {
    title: "",
  };
  quitApp = (): void => {
    ipcRenderer.send("quit");
  };

  constructor(props: EmptyObject) {
    super(props);
    // update theme without invoking updateUI
    // because it's the first time to load theme
    // and the updateUI is not yet initialized
    updateTheme(false);
    // init static
    App.updateUI = () => this.setState({});
  }
  render(): JSX.Element {
    const isAtHome = this.state.title === "Epherome";
    return (
      <IconContext.Provider value={{ size: "1.5em" }}>
        <GlobalOverlay />
        <div className="bg-primary shadow-lg flex py-2 px-3 items-center z-30 top-0 h-16 eph-dragging-area">
          <IconButton
            className="text-white eph-non-dragging-area"
            onClick={isAtHome ? unwrapFunction() : hist.goBack}
          >
            {isAtHome ? <MdMenu /> : <MdArrowBack />}
          </IconButton>
          <p className="flex-grow pl-3 select-none text-white text-xl">{this.state.title}</p>
        </div>
        <Router
          initial="home"
          history={hist}
          routes={[
            { pathname: "home", component: <HomePage />, title: () => t.epherome },
            { pathname: "accounts", component: <AccountsPage />, title: () => t.accounts },
            { pathname: "profiles", component: <ProfilesPage />, title: () => t.profiles },
            { pathname: "settings", component: <SettingsPage />, title: () => t.settings },
            { pathname: "downloads", component: <DownloadsPage />, title: () => t.downloads },
            { pathname: "processes", component: <ProcessesPage />, title: () => t.processes },
            { pathname: "extensions", component: <ExtensionsPage />, title: () => t.extensions },
          ]}
          onChange={(title) => this.setState({ title })}
        />
      </IconContext.Provider>
    );
  }
}
