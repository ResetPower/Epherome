import React, { FunctionComponentElement, useState } from "react";
import { ThemeProvider } from "@material-ui/styles";
import {
  AppBar,
  CssBaseline,
  Icon,
  IconButton,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Router, Switch as RouterSwitch, Route } from "react-router";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import HomePage from "../routes/HomePage";
import AccountsPage from "../routes/AccountsPage";
import ProfilesPage from "../routes/ProfilesPage";
import SettingsPage from "../routes/SettingsPage";
import { resolveTitle } from "../renderer/titles";
import { hist, lightTheme, darkTheme } from "../renderer/global";
import { readConfig } from "../renderer/config";

const useStyle = makeStyles({
  titleText: {
    flexGrow: 1,
    fontWeight: 400,
    paddingLeft: "10px",
    userSelect: "none",
  },
});

export default function App(): FunctionComponentElement<EmptyProps> {
  const classes = useStyle();
  const location = hist.location;
  const [theTheme, setTheTheme] = useState(
    readConfig<string>("theme", "light") === "dark" ? darkTheme : lightTheme
  );
  const [title, setTitle] = useState(resolveTitle(location.pathname));
  const [icon, setIcon] = useState(location.pathname === "/" ? "menu" : "arrow_back");
  const handleBack = () => {
    hist.goBack();
  };
  const setTheme = (str: string) => {
    setTheTheme(str === "dark" ? darkTheme : lightTheme);
  };
  hist.listen((loc) => {
    setIcon(loc.pathname === "/" ? "menu" : "arrow_back");
    setTitle(resolveTitle(loc.pathname));
  });

  return (
    <ThemeProvider theme={theTheme}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <Icon>{icon}</Icon>
          </IconButton>
          <Typography className={classes.titleText} variant="h6">
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Router history={hist}>
        <TransitionGroup>
          <CSSTransition classNames="fade" timeout={300} key={location.pathname} unmountOnExit>
            <RouterSwitch location={location}>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/accounts" component={AccountsPage} />
              <Route exact path="/profiles" component={ProfilesPage} />
              <Route exact path="/settings">
                <SettingsPage setTheme={setTheme} />
              </Route>
            </RouterSwitch>
          </CSSTransition>
        </TransitionGroup>
      </Router>
    </ThemeProvider>
  );
}
