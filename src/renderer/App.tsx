import { Component } from "react";
import AppBar from "../components/AppBar";
import IconButton from "../components/IconButton";
import HomePage from "../pages/HomePage";
import AccountsPage from "../pages/AccountsPage";
import ProfilesPage from "../pages/ProfilesPage";
import SettingsPage from "../pages/SettingsPage";
import { resolveTitle } from "./titles";
import ProfileManagementPage from "../pages/ProfileManagementPage";
import { EmptyObject, StringMap } from "../tools/types";
import DownloadsPage from "../pages/DownloadsPage";
import GlobalOverlay from "../components/GlobalOverlay";
import { Router } from "../router/Router";
import { hist } from "./global";
import { updateTheme } from "./theme";
import { MdArrowBack } from "react-icons/md";
import { FaLayerGroup } from "react-icons/fa";
import { IconContext } from "react-icons/lib";
import { ipcRenderer } from "electron";
import { unwrapFunction } from "../tools";

export interface AppState {
  title: string;
}

export const AppSpace = {
  updateTitle: unwrapFunction(),
  updateUI: unwrapFunction(),
};

export default class App extends Component<EmptyObject, AppState> {
  state: AppState = {
    title: resolveTitle(hist.pathname()),
  };
  updateTitle = (): void => {
    this.setState({
      title: resolveTitle(hist.location.pathname),
    });
  };
  quitApp = (): void => {
    ipcRenderer.send("quit");
  };
  constructor(props: EmptyObject) {
    super(props);
    updateTheme();
    // init space
    AppSpace.updateTitle = this.updateTitle;
    AppSpace.updateUI = () => this.setState({});
  }
  render(): JSX.Element {
    const isAtHome = this.state.title === "Epherome";
    return (
      <IconContext.Provider value={{ size: "1.5em" }}>
        <GlobalOverlay />
        <AppBar className="mb-2 eph-dragging-area">
          <IconButton
            className="text-white eph-non-dragging-area"
            onClick={isAtHome ? unwrapFunction() : hist.goBack}
          >
            {isAtHome ? <FaLayerGroup size="1.2rem" /> : <MdArrowBack />}
          </IconButton>
          <p className="flex-grow pl-3 select-none text-white text-xl">{this.state.title}</p>
        </AppBar>
        <Router
          history={hist}
          routes={[
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
              component: (params: StringMap): JSX.Element => (
                <ProfileManagementPage params={params} />
              ),
            },
          ]}
          onChange={this.updateTitle}
        />
      </IconContext.Provider>
    );
  }
}
