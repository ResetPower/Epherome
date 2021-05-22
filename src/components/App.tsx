import { Component } from "react";
import { ThemeProvider } from "@material-ui/styles";
import { AppBar, CssBaseline, Icon, IconButton, Toolbar, Typography } from "@material-ui/core";
import { Router, Switch as RouterSwitch, Route } from "react-router";
import HomePage from "../routes/HomePage";
import AccountsPage from "../routes/AccountsPage";
import ProfilesPage from "../routes/ProfilesPage";
import SettingsPage from "../routes/SettingsPage";
import { resolveTitle } from "../renderer/titles";
import { hist, lightTheme, darkTheme } from "../renderer/global";
import ProfileManagementPage from "../routes/ProfileManagementPage";
import "../styles/app.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { subscribe } from "../renderer/session";
import { ephConfigs } from "../renderer/config";
import { EmptyProps } from "../tools/types";

export interface AppState {
  title: string;
}

export default class App extends Component<EmptyProps, AppState> {
  state: AppState = {
    title: resolveTitle(hist.location.pathname),
  };
  constructor(props: EmptyProps) {
    super(props);
    hist.listen((loc) =>
      this.setState({
        title: resolveTitle(loc.pathname),
      })
    );
    subscribe("theme", () => this.setState({}));
  }
  render() {
    return (
      <ThemeProvider theme={ephConfigs.theme === "dark" ? darkTheme : lightTheme}>
        <CssBaseline />
        <AppBar position="fixed">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={hist.goBack}>
              <Icon>{this.state.title === "Epherome" ? "menu" : "arrow_back"}</Icon>
            </IconButton>
            <Typography className="eph-title" variant="h6">
              {this.state.title}
            </Typography>
          </Toolbar>
        </AppBar>
        <Router history={hist}>
          <TransitionGroup>
            <CSSTransition classNames="fade" key={hist.location.pathname} timeout={250}>
              <RouterSwitch location={hist.location}>
                <Route exact path="/" component={HomePage} />
                <Route exact path="/accounts" component={AccountsPage} />
                <Route exact path="/profiles" component={ProfilesPage} />
                <Route exact path="/settings" component={SettingsPage} />
                <Route exact path="/profile/:id" component={ProfileManagementPage} />
              </RouterSwitch>
            </CSSTransition>
          </TransitionGroup>
        </Router>
      </ThemeProvider>
    );
  }
}
