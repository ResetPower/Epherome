import React, { FunctionComponentElement, useState } from "react";
import { ThemeProvider } from "@material-ui/styles";
import { AppBar, Icon, IconButton, makeStyles, Toolbar, Typography } from "@material-ui/core";
import { Router, Switch as RouterSwitch, Route } from "react-router";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import HomePage from "../routes/HomePage";
import AccountsPage from "../routes/AccountsPage";
import ProfilesPage from "../routes/ProfilesPage";
import SettingsPage from "../routes/SettingsPage";
import { resolveTitle } from "../renderer/titles";
import { hist, theme } from "../renderer/global";

const useStyle = makeStyles({
  title: {
    flexGrow: 1,
    fontWeight: 400,
    paddingLeft: "10px",
    userSelect: "none",
  },
});

export default function App(): FunctionComponentElement<EmptyProps> {
  const classes = useStyle();
  const location = hist.location;
  const [title, setTitle] = useState(resolveTitle(location.pathname));
  const [icon, setIcon] = useState(location.pathname === "/" ? "menu" : "arrow_back");
  const handleBack = () => {
    hist.goBack();
  };
  hist.listen((loc) => {
    setIcon(loc.pathname === "/" ? "menu" : "arrow_back");
    setTitle(resolveTitle(loc.pathname));
  });

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <Icon>{icon}</Icon>
          </IconButton>
          <Typography className={classes.title} variant="h6">
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
              <Route exact path="/settings" component={SettingsPage} />
            </RouterSwitch>
          </CSSTransition>
        </TransitionGroup>
      </Router>
    </ThemeProvider>
  );
}
