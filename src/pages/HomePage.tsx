import Select from "../components/Select";
import Container from "../components/Container";
import Button from "../components/Button";
import IconButton from "../components/IconButton";
import { Component } from "react";
import { hist, logger } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { getAccount, MinecraftAccount } from "../struct/accounts";
import { getProfile, MinecraftProfile } from "../struct/profiles";
import { t } from "../renderer/global";
import { MinecraftLaunchDetail } from "../core";
import { EmptyObject } from "../tools/types";
import { fetchHitokoto, Hitokoto } from "../struct/hitokoto";
import { showDialog } from "../renderer/overlay";
import LaunchProgress from "../components/LaunchProgress";
import Card from "../components/Card";
import Typography from "../components/Typography";
import { AlertDialog } from "../components/Dialog";
import Tooltip from "../components/Tooltip";
import {
  MdAccountCircle,
  MdApps,
  MdGamepad,
  MdPlayArrow,
  MdRefresh,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";

export interface HomePageState {
  details: MinecraftLaunchDetail[];
  hitokoto: Hitokoto;
  value: number | string;
  againRequestPassword: boolean;
}

export default class HomePage extends Component<EmptyObject, HomePageState> {
  state: HomePageState = {
    details: [],
    value: "",
    hitokoto: { content: "...", from: "..." },
    againRequestPassword: false,
  };
  static hitokoto: Hitokoto | null = null;
  enableHitokoto = ephConfigs.hitokoto;
  account: MinecraftAccount | null;
  constructor(props: EmptyObject) {
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
        <AlertDialog title={t.warning} message={t.noAccOrProSelected} close={close} />
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
                {username === undefined ? t.noAccSelected : username}
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
              <IconButton>
                <MdViewCarousel />
              </IconButton>
              <IconButton>
                <MdApps />
              </IconButton>
            </div>
          </div>
          <div className="flex">
            <Button onClick={() => hist.push("/accounts")}>
              <MdAccountCircle /> {t.accounts}
            </Button>
            <Button onClick={() => hist.push("/profiles")}>
              <MdGamepad /> {t.profiles}
            </Button>
            <div className="flex-grow" />
            {this.enableHitokoto && (
              <Tooltip title={t.refreshHitokoto}>
                <IconButton onClick={this.reloadHitokoto}>
                  <MdRefresh />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={() => hist.push("/settings")}>
              <MdSettings />
            </IconButton>
          </div>
        </Card>
        <div className="flex space-x-6">
          <Card className="flex-grow">
            {profiles.length === 0 ? (
              <Typography className="p-3">{t.noProSelected}</Typography>
            ) : (
              <Select value={this.state.value} onChange={this.handleChange}>
                {profiles.map((i: MinecraftProfile) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            )}
            <Button onClick={this.handleLaunch}>
              <MdPlayArrow />
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
