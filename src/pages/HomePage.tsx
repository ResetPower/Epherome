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
import { getProfile, MinecraftProfile } from "../renderer/profiles";
import { t } from "../renderer/global";
import { MinecraftLaunchDetail } from "../core/core";
import { EmptyProps } from "../tools/types";
import { showDialog } from "../renderer/overlay";
import LaunchProgress from "../components/LaunchProgress";
import Card from "../components/Card";
import Typography from "../components/Typography";
import { ephFetch } from "../tools/http";
import { isSuccess } from "../tools/auth";

export interface HomePageState {
  details: MinecraftLaunchDetail[];
  hitokotoContent: string;
  hitokotoFrom: string;
  value: number | string;
  againRequestPassword: boolean;
}

export default class HomePage extends Component<EmptyProps, HomePageState> {
  state: HomePageState = {
    details: [],
    value: "",
    hitokotoContent: "...",
    hitokotoFrom: "...",
    againRequestPassword: false,
  };
  enableHitokoto = ephConfigs.hitokoto;
  account: MinecraftAccount | null;
  constructor(props: EmptyProps) {
    super(props);
    const tId = ephConfigs.selectedProfile;
    const profile = getProfile(tId);
    this.state.value = profile === null ? "" : tId;
    this.account = getAccount(ephConfigs.selectedAccount);
  }
  componentDidMount(): void {
    this.reloadHitokoto();
  }
  reloadHitokoto = (): void => {
    if (this.enableHitokoto) {
      this.setState({
        hitokotoContent: "...",
        hitokotoFrom: "...",
      });
      ephFetch("https://api.epherome.com/hitokoto").then((resp) => {
        if (isSuccess(resp.status) && !resp.err) {
          const parsed = JSON.parse(resp.text);
          this.setState({
            hitokotoContent: parsed.content,
            hitokotoFrom: `——${parsed.from}`,
          });
        } else {
          this.setState({
            hitokotoContent: t("cannotConnectToHitokoto"),
            hitokotoFrom: "",
          });
        }
      });
    }
  };
  // handle minecraft profile select
  handleChange = (ev: ChangeEvent<HTMLSelectElement>): void => {
    setConfig(() => (ephConfigs.selectedProfile = parseInt(ev.target.value)));
    this.setState({ value: parseInt(ev.target.value) });
  };
  handleLaunch = (): void => {
    // value will be "" if not selected
    if (this.state.value !== "") {
      const val = Number(this.state.value);
      const account = this.account;
      const profile = getProfile(val);
      if (account !== null && profile !== null) {
        showDialog((close) => (
          <LaunchProgress onClose={close} account={account} profile={profile} />
        ));
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
            <p className="text-shallow mt-0">{t("hello")}</p>
            <Typography className="text-2xl">
              {username === undefined ? "Tourist" : username}
            </Typography>
            {this.enableHitokoto && (
              <div>
                <Typography className="text-sm">{this.state.hitokotoContent}</Typography>
                <Typography className="text-sm text-shallow" textInherit>
                  {this.state.hitokotoFrom}
                </Typography>
              </div>
            )}
          </div>
          <div className="flex">
            <Button onClick={() => hist.push("/accounts")}>
              <Icon>account_circle</Icon> {t("accounts")}
            </Button>
            <Button onClick={() => hist.push("/profiles")}>
              <Icon>gamepad</Icon> {t("profiles")}
            </Button>
            <div className="flex-grow" />
            {this.enableHitokoto && (
              <IconButton onClick={this.reloadHitokoto}>
                <Icon>refresh</Icon>
              </IconButton>
            )}
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
