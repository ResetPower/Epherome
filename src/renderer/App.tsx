import { Component } from "react";
import HomePage from "../views/HomePage";
import AccountsPage from "../views/AccountsPage";
import ProfilesPage from "../views/ProfilesPage";
import SettingsPage from "../views/SettingsPage";
import { Accessible, EmptyObject, StringMap, unwrapAccessible } from "../tools";
import DownloadsPage from "../views/DownloadsPage";
import { GlobalOverlay } from "./overlays";
import { historyStore } from "./history";
import { themeStore } from "./theme";
import { MdArrowBack, MdMenu } from "react-icons/md";
import { IconContext } from "react-icons/lib";
import { unwrapFunction } from "../tools";
import ProcessesPage from "../views/ProcessesPage";
import ExtensionsPage from "../views/ExtensionsPage";
import { IconButton } from "../components/inputs";
import { t } from "../intl";
import { CSSTransition, SwitchTransition } from "react-transition-group";

export interface AppState {
  title: string;
}

export interface RouteList {
  [key: string]: {
    component: Accessible<JSX.Element, [StringMap]>;
    title: Accessible<string>;
  };
}

export default class App extends Component<EmptyObject, AppState> {
  state: AppState = {
    title: "",
  };
  routes: RouteList = {
    home: {
      component: <HomePage />,
      title: (): string => t("epherome"),
    },
    accounts: {
      component: <AccountsPage />,
      title: (): string => t("accounts"),
    },
    profiles: {
      component: <ProfilesPage />,
      title: (): string => t("profiles"),
    },
    settings: {
      component: <SettingsPage />,
      title: (): string => t("settings"),
    },
    downloads: {
      component: <DownloadsPage />,
      title: (): string => t("downloads"),
    },
    processes: {
      component: <ProcessesPage />,
      title: (): string => t("processes"),
    },
    extensions: {
      component: <ExtensionsPage />,
      title: (): string => t("extensions"),
    },
  };
  constructor(props: EmptyObject) {
    super(props);
    themeStore.updateTheme();
  }
  updateTitle = (): void =>
    this.setState({
      title:
        unwrapAccessible(
          this.routes[historyStore.current?.pathname ?? ""]?.title
        ) ?? "",
    });
  componentDidMount(): void {
    historyStore.isEmpty && historyStore.push("home");
    this.updateTitle();
    historyStore.listen(this.updateTitle);
  }
  render(): JSX.Element {
    const route = this.routes[historyStore.current?.pathname ?? ""];
    const isAtHome = this.state.title === "Epherome";
    return (
      <IconContext.Provider value={{ size: "1.5em" }}>
        <GlobalOverlay />
        <div className="eph-appbar">
          <IconButton
            className="text-white"
            onClick={isAtHome ? unwrapFunction() : historyStore.back}
          >
            {isAtHome ? <MdMenu /> : <MdArrowBack />}
          </IconButton>
          <p className="eph-appbar-title">{this.state.title}</p>
        </div>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={historyStore.current?.pathname}
            timeout={150}
            classNames="fade"
          >
            {unwrapAccessible(
              route?.component,
              historyStore.current?.params ?? {}
            ) ?? <></>}
          </CSSTransition>
        </SwitchTransition>
      </IconContext.Provider>
    );
  }
}
