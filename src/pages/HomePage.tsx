import Select from "../components/Select";
import Container from "../components/Container";
import Icon from "../components/Icon";
import Button from "../components/Button";
import IconButton from "../components/IconButton";
import { Component } from "react";
import { hist, logger } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { getAccount, MinecraftAccount } from "../renderer/accounts";
import { getProfile, MinecraftProfile } from "../renderer/profiles";
import { t } from "../renderer/global";
import { MinecraftLaunchDetail } from "../core";
import { EmptyProps } from "../tools/types";
import { fetchHitokoto, Hitokoto } from "../renderer/hitokoto";
import { showDialog } from "../renderer/overlay";
import LaunchProgress from "../components/LaunchProgress";
import Card from "../components/Card";
import Typography from "../components/Typography";
import Dialog from "../components/Dialog";
import Tooltip from "../components/Tooltip";

export interface HomePageState {
  details: MinecraftLaunchDetail[];
  hitokoto: Hitokoto;
  value: number | string;
  againRequestPassword: boolean;
}

export default class HomePage extends Component<EmptyProps, HomePageState> {
  state: HomePageState = {
    details: [],
    value: "",
    hitokoto: { content: "...", from: "..." },
    againRequestPassword: false,
  };
  static hitokoto: Hitokoto | null = null;
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
    if (!HomePage.hitokoto) {
      this.reloadHitokoto();
    } else {
      this.setState({
        hitokoto: HomePage.hitokoto,
      });
    }
  }
  reloadHitokoto = (): void => {
    if (this.enableHitokoto) {
      this.setState({ hitokoto: { content: "...", from: "..." } });
      fetchHitokoto().then((hk) => {
        if (hk === null) {
          this.setState({
            hitokoto: {
              content: t.cannotConnectToHitokoto,
              from: "",
            },
          });
        } else {
          HomePage.hitokoto = hk;
          this.setState({
            hitokoto: hk,
          });
        }
      });
    }
  };
  // handle minecraft profile select
  handleChange = (val: string): void => {
    const newValue = parseInt(val);
    setConfig(() => (ephConfigs.selectedProfile = newValue));
    logger.info(`Profile selection changed to id ${newValue}`);
    this.setState({ value: newValue });
  };
  handleLaunch = (): void => {
    // value will be "" if not selected
    const val = Number(this.state.value);
    const account = this.account;
    const profile = getProfile(val);
    if (account !== null && profile !== null) {
      showDialog((close) => <LaunchProgress onClose={close} account={account} profile={profile} />);
    } else {
      showDialog((close) => (
        <Dialog indentBottom>
          <Typography className="text-lg px-3">{t.warning}</Typography>
          <div className="p-6">{t.noAccOrProSelected}</div>
          <div className="flex justify-end">
            <Button onClick={close}>{t.ok}</Button>
          </div>
        </Dialog>
      ));
    }
  };
  render(): JSX.Element {
    const profiles = ephConfigs.profiles;
    const username = this.account?.name;
    return (
      <Container>
        <Card className="mb-3 p-6 shadow-sm">
          <div className="flex">
            <div className="p-3 flex-grow">
              <p className="text-shallow mt-0">{t.hello}</p>
              <Typography className="text-2xl">
                {username === undefined ? "Tourist" : username}
              </Typography>
              {this.enableHitokoto && (
                <div>
                  <Typography className="text-sm">{this.state.hitokoto.content}</Typography>
                  <Typography className="text-sm text-shallow" textInherit>
                    {this.state.hitokoto.from}
                  </Typography>
                </div>
              )}
            </div>
            <div>
              <Tooltip title="Process" direction="left">
                <IconButton>
                  <Icon>layers</Icon>
                </IconButton>
              </Tooltip>
              <Tooltip title="Extensions" direction="left">
                <IconButton>
                  <Icon>apps</Icon>
                </IconButton>
              </Tooltip>
            </div>
          </div>
          <div className="flex">
            <Button onClick={() => hist.push("/accounts")}>
              <Icon>account_circle</Icon> {t.accounts}
            </Button>
            <Button onClick={() => hist.push("/profiles")}>
              <Icon>gamepad</Icon> {t.profiles}
            </Button>
            <div className="flex-grow" />
            {this.enableHitokoto && (
              <Tooltip title="Refresh">
                <IconButton onClick={this.reloadHitokoto}>
                  <Icon>refresh</Icon>
                </IconButton>
              </Tooltip>
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
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
            <Button onClick={this.handleLaunch}>
              <Icon>play_arrow</Icon>
              {t.launch}
            </Button>
          </Card>
          <Card className="flex-grow">
            <Typography className="text-xl">{t.warning}</Typography>
            <Typography>{t.alphaWarning}</Typography>
          </Card>
        </div>
      </Container>
    );
  }
}
