import Grid from "../components/Grid";
import Card from "../components/Card";
import Select from "../components/Select";
import SelectItem from "../components/SelectItem";
import Typography from "../components/Typography";
import Container from "../components/Container";
import Icon from "../components/Icon";
import Button from "../components/Button";
import { ChangeEvent, Component } from "react";
import { hist } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { getById } from "../tools/arrays";
import { MinecraftAccount } from "../renderer/accounts";
import { broadcast, subscribeAsync } from "../renderer/session";
import { MinecraftProfile } from "../renderer/profiles";
import { t } from "../renderer/global";
import { launchMinecraft, MinecraftLaunchDetail } from "../core/core";
import { EmptyProps } from "../tools/types";

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
    profiles: ephConfigs.profiles,
    details: [],
    helperText: "...",
    value: "",
    againRequestPassword: false,
    stacktrace: "",
    reqPw: false,
  };
  constructor(props: EmptyProps) {
    super(props);
    const tId = ephConfigs.selectedProfile;
    const profile = getById(this.state.profiles, tId);
    this.state.value = profile === null ? "" : tId;
  }
  render(): JSX.Element {
    const accountId = ephConfigs.selectedAccount;
    const account = getById<MinecraftAccount>(ephConfigs.accounts, accountId);
    const username = account?.name;
    // handle minecraft profile select
    const handleChange = (ev: ChangeEvent<HTMLSelectElement>) => {
      setConfig(() => (ephConfigs.selectedProfile = parseInt(ev.target.value)));
      this.setState({ value: parseInt(ev.target.value) });
    };
    const handlePassword = (password: string) => {
      broadcast("password", password);
    };
    const handleLaunch = () => {
      if (typeof this.state.value === "number") {
        const profile = getById(this.state.profiles, this.state.value);
        if (account !== null && profile !== null) {
          this.setState({
            minecraftDialog: true,
          });
          const onErr = (err: Error) =>
            this.setState({
              minecraftDialog: false,
              stacktrace: err.stack ?? "",
              errDialog: true,
            });
          launchMinecraft({
            account,
            profile,
            setDetails: (det) => this.setState({ details: det }),
            setHelper: (hel) => this.setState({ helperText: hel }),
            java: ephConfigs.javaPath,
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
              return await subscribeAsync("password");
            },
            onErr,
          }).catch(onErr);
        }
      }
    };
    return (
      <Container className="eph-home-page">
        <Card className="p-4 mb-3" variant="outlined">
          <div>
            <div className="text-gray-500 mt-0">{t("hello")}</div>
            <div className="text-2xl">{username === undefined ? "Tourist" : username}</div>
            <div>{t("hitokoto")}</div>
          </div>
          <div>
            <Button onClick={() => hist.push("/accounts")}>
              <Icon>account_circle</Icon> {t("accounts")}
            </Button>
            <Button onClick={() => hist.push("/profiles")}>
              <Icon>gamepad</Icon> {t("profiles")}
            </Button>
            <div className="flex-grow" />
            <Button variant="contained" onClick={() => hist.push("/settings")}>
              <Icon>settings</Icon> {t("settings")}
            </Button>
          </div>
        </Card>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Card className="p-4" variant="outlined">
              <Select value={this.state.value} onChange={handleChange}>
                {this.state.profiles.map((i: MinecraftProfile) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.name}
                  </SelectItem>
                ))}
              </Select>
              <Button onClick={handleLaunch}>
                <Icon>play_arrow</Icon>
                {t("launch")}
              </Button>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card className="p-3" variant="outlined">
              <Typography variant="h5">{t("warning")}</Typography>
              <Typography>{t("alphaWarning")}</Typography>
              <br />
              <br />
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }
}
