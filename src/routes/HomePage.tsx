import { FormControl, Grid, Icon, InputLabel, MenuItem, Select } from "@material-ui/core";
import { Container, Button, Typography, Card, CardActions, CardContent } from "@material-ui/core";
import React, { Component } from "react";
import { hist } from "../renderer/global";
import { epheromeConfigs, readConfig, writeConfig } from "../renderer/config";
import { getById } from "../tools/arrays";
import { MinecraftAccount } from "../renderer/accounts";
import { useSubscriptionAsync } from "../renderer/hooks";
import { MinecraftProfile } from "../renderer/profiles";
import { t } from "../renderer/global";
import LaunchProgress from "../components/LaunchProgress";
import { launchMinecraft, MinecraftLaunchDetail } from "../core/core";
import { ErrorDialog, RequestPasswordDialog } from "../components/Dialogs";
import { setSession } from "../renderer/session";
import "../styles/home.css";

export interface HomePageState {
  minecraftDialog: boolean;
  errDialog: boolean;
  profiles: MinecraftProfile[];
  details: MinecraftLaunchDetail[];
  helperText: string;
  value: number | string;
  againRequestPassword: boolean;
  stacktrace: string;
  reqPw: boolean;
}

export default class HomePage extends Component<EmptyProps, HomePageState> {
  state: HomePageState = {
    minecraftDialog: false,
    errDialog: false,
    profiles: epheromeConfigs.profiles,
    details: [],
    helperText: "...",
    value: "",
    againRequestPassword: false,
    stacktrace: "",
    reqPw: false,
  };
  constructor(props: EmptyProps) {
    super(props);
    const tId = epheromeConfigs.selectedProfile;
    const profile = getById(this.state.profiles, tId);
    this.state.value = profile === null ? "" : tId;
  }
  render() {
    const accountId = readConfig("selectedAccount", 0);
    const account = getById<MinecraftAccount>(readConfig("accounts", []), accountId);
    const username = account?.name;
    // handle minecraft profile select
    const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
      writeConfig("selectedProfile", ev.target.value as number);
      this.setState({ value: ev.target.value as number });
    };
    const handlePassword = (password: string) => {
      setSession("password", password);
    };
    const handleLaunch = () => {
      if (typeof this.state.value === "number") {
        const profile = getById(this.state.profiles, this.state.value);
        if (account !== null && profile !== null) {
          this.setState({
            minecraftDialog: true,
          });
          launchMinecraft({
            account,
            profile,
            setDetails: (det) => this.setState({ details: det }),
            setHelper: (hel) => this.setState({ helperText: hel }),
            java: readConfig("javaPath", "java"),
            onDone: () => this.setState({ minecraftDialog: false }),
            requestPassword: async (again: boolean) => {
              if (again !== this.state.againRequestPassword) {
                this.setState({
                  againRequestPassword: again,
                });
              }
              this.setState({
                reqPw: true,
              });
              return await useSubscriptionAsync<string>("password");
            },
          }).catch((err) => {
            this.setState({
              minecraftDialog: false,
              stacktrace: err.stack,
              errDialog: true,
            });
          });
        }
      }
    };
    return (
      <Container className="eph-home-page">
        <Card className="eph-top-card" variant="outlined">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {t("hello")}
            </Typography>
            <Typography variant="h5">{username === undefined ? "Tourist" : username}</Typography>
            <Typography>{t("hitokoto")}</Typography>
          </CardContent>
          <CardActions>
            <Button onClick={() => hist.push("/accounts")}>
              <Icon>account_circle</Icon> {t("accounts")}
            </Button>
            <Button onClick={() => hist.push("/profiles")}>
              <Icon>gamepad</Icon> {t("profiles")}
            </Button>
            <div className="eph-space"></div>
            <Button variant="outlined" onClick={() => hist.push("/settings")}>
              <Icon>settings</Icon> {t("settings")}
            </Button>
          </CardActions>
        </Card>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Card className="eph-card" variant="outlined">
              <div className="eph-padding" />
              <FormControl variant="standard" fullWidth>
                <InputLabel>Minecraft</InputLabel>
                <Select value={this.state.value} onChange={handleChange}>
                  {this.state.profiles.map((i: MinecraftProfile) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <div className="eph-padding" />
              <Button variant="outlined" size="large" color="secondary" onClick={handleLaunch}>
                <Icon>play_arrow</Icon>
                {t("launch")}
              </Button>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card className="eph-card" variant="outlined">
              <Typography variant="h5">{t("warning")}</Typography>
              <Typography>{t("alphaWarning")}</Typography>
              <br />
              <br />
            </Card>
          </Grid>
        </Grid>
        <LaunchProgress
          open={this.state.minecraftDialog}
          onClose={() =>
            this.setState({
              minecraftDialog: false,
            })
          }
          details={this.state.details}
          helperText={this.state.helperText}
        />
        <RequestPasswordDialog
          callback={handlePassword}
          open={this.state.reqPw}
          again={this.state.againRequestPassword}
          onClose={() =>
            this.setState({
              reqPw: false,
            })
          }
        />
        <ErrorDialog
          open={this.state.errDialog}
          onClose={() => this.setState({ errDialog: false })}
          stacktrace={this.state.stacktrace}
        />
      </Container>
    );
  }
}
