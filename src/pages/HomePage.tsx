import Select from "../components/Select";
import SelectItem from "../components/SelectItem";
import Container from "../components/Container";
import Icon from "../components/Icon";
import Button from "../components/Button";
import IconButton from "../components/IconButton";
import { ChangeEvent, Component } from "react";
import { hist } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { getAccount, MinecraftAccount } from "../renderer/accounts";
import { broadcast, subscribeAsync } from "../renderer/session";
import { getProfile, MinecraftProfile } from "../renderer/profiles";
import { t } from "../renderer/global";
import { launchMinecraft, MinecraftLaunchDetail } from "../core/core";
import { EmptyProps } from "../tools/types";
import { makeDialog, showDialog } from "../renderer/overlay";
import LaunchProgress from "../components/LaunchProgress";
import { ErrorDialog, RequestPasswordDialog } from "../components/Dialogs";
import Card from "../components/Card";
import Typography from "../components/Typography";

export interface HomePageState {
  details: MinecraftLaunchDetail[];
  helperText: string;
  value: number | string;
  againRequestPassword: boolean;
}

export default class HomePage extends Component<EmptyProps, HomePageState> {
  state: HomePageState = {
    details: [],
    helperText: "...",
    value: "",
    againRequestPassword: false,
  };
  // launch progress dialog controllers
  openLaunchProgress: () => void;
  closeLaunchProgress: () => void;

  account: MinecraftAccount | null;
  constructor(props: EmptyProps) {
    super(props);
    const tId = ephConfigs.selectedProfile;
    const profile = getProfile(tId);
    this.state.value = profile === null ? "" : tId;
    const controllerSet = makeDialog((close) => (
      <LaunchProgress onClose={close} details={[]} helperText={"Launching..."} />
    ));
    this.openLaunchProgress = controllerSet[0];
    this.closeLaunchProgress = controllerSet[1];
    this.account = getAccount(ephConfigs.selectedAccount);
  }
  // handle minecraft profile select
  handleChange = (ev: ChangeEvent<HTMLSelectElement>) => {
    setConfig(() => (ephConfigs.selectedProfile = parseInt(ev.target.value)));
    this.setState({ value: parseInt(ev.target.value) });
  };
  // handle password response (from (RequestPasswordDialog))
  handlePassword = (password: string) => {
    broadcast("password", password);
  };
  handleLaunch = () => {
    // value will be "" if not selected
    if (this.state.value !== "") {
      const val = Number(this.state.value);
      const profile = getProfile(val);
      if (this.account !== null && profile !== null) {
        this.openLaunchProgress();
        const onErr = (err: Error) => {
          this.closeLaunchProgress();
          showDialog((close) => <ErrorDialog onClose={close} stacktrace={err.stack ?? " "} />);
        };
        launchMinecraft({
          account: this.account,
          profile,
          setDetails: (det) => this.setState({ details: det }),
          setHelper: (hel) => this.setState({ helperText: hel }),
          java: ephConfigs.javaPath,
          onDone: this.closeLaunchProgress,
          requestPassword: async (again: boolean) => {
            if (again !== this.state.againRequestPassword) {
              this.setState({
                againRequestPassword: again,
              });
            }
            showDialog((close) => (
              <RequestPasswordDialog
                onClose={close}
                again={this.state.againRequestPassword}
                callback={this.handlePassword}
              />
            ));
            return await subscribeAsync("password");
          },
          onErr,
        }).catch(onErr);
      }
    }
  };
  render(): JSX.Element {
    const profiles = ephConfigs.profiles;
    const username = this.account?.name;
    return (
      <Container>
        <Card className="mb-3 p-6 shadow-sm">
          <div className="p-3">
            <p className="text-gray-400 mt-0">{t("hello")}</p>
            <Typography className="text-2xl">
              {username === undefined ? "Tourist" : username}
            </Typography>
            <Typography>{t("hitokoto")}</Typography>
          </div>
          <div className="flex">
            <Button onClick={() => hist.push("/accounts")}>
              <Icon>account_circle</Icon> {t("accounts")}
            </Button>
            <Button onClick={() => hist.push("/profiles")}>
              <Icon>gamepad</Icon> {t("profiles")}
            </Button>
            <div className="flex-grow" />
            <IconButton onClick={() => hist.push("/settings")}>
              <Icon>settings</Icon>
            </IconButton>
          </div>
        </Card>
        <div className="flex space-x-6">
          <Card className="flex-grow">
            <Select value={this.state.value} onChange={this.handleChange}>
              {profiles.map((i: MinecraftProfile) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.name}
                </SelectItem>
              ))}
            </Select>
            <Button onClick={this.handleLaunch}>
              <Icon>play_arrow</Icon>
              {t("launch")}
            </Button>
          </Card>
          <Card className="flex-grow">
            <Typography className="text-xl">{t("warning")}</Typography>
            <Typography>{t("alphaWarning")}</Typography>
          </Card>
        </div>
      </Container>
    );
  }
}
