import { Select, Button, IconButton, TextField } from "../components/inputs";
import { Component, useState } from "react";
import { hist, logger } from "../renderer/global";
import { ephConfigs, setConfig } from "../struct/config";
import { MinecraftAccount } from "../struct/accounts";
import { MinecraftProfile } from "../struct/profiles";
import { t } from "../renderer/global";
import { launchMinecraft, MinecraftLaunchDetail } from "../core";
import { DefaultFunction, EmptyObject } from "../tools/types";
import { fetchHitokoto, Hitokoto } from "../struct/hitokoto";
import { Card, Typography, Container } from "../components/layouts";
import Dialog, { AlertDialog } from "../components/Dialog";
import {
  MdAccountCircle,
  MdApps,
  MdGamepad,
  MdPlayArrow,
  MdRefresh,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";
import { showDialog } from "../components/GlobalOverlay";
import { ErrorDialog } from "../components/Dialogs";
import { initRequiredFunction } from "../tools";

export function RequestPasswordDialog(props: {
  again: boolean;
  onClose: DefaultFunction;
  callback: (password: string) => void;
}): JSX.Element {
  const [password, setPassword] = useState("");
  const handler = () => {
    props.onClose();
    props.callback(password);
  };

  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">
        {t.pleaseInputPassword}
      </Typography>
      <div>
        <TextField
          value={password}
          onChange={setPassword}
          label={t.password}
          type="password"
          helperText={props.again ? t.passwordWrong : ""}
          error={props.again}
        />
      </div>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={props.onClose}>
          {t.cancel}
        </Button>
        <Button onClick={handler}>{t.ok}</Button>
      </div>
    </Dialog>
  );
}

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
  static updateHomePage = initRequiredFunction();
  static staticState = {
    isLaunching: false,
    launchingHelper: "",
  };
  static setStaticState = (
    state: Partial<typeof HomePage.staticState>
  ): void => {
    Object.assign(HomePage.staticState, state);
    this.updateHomePage();
  };
  static hitokoto: Hitokoto | null = null;
  enableHitokoto = ephConfigs.hitokoto;
  account: MinecraftAccount | undefined;
  constructor(props: EmptyObject) {
    super(props);
    this.state.value = ephConfigs.profiles.getSelectedIndex() ?? "";
    this.account = ephConfigs.accounts.getSelected();
    // init static
    HomePage.updateHomePage = () => this.setState({});
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
          const hk: Hitokoto = {
            content: t.cannotConnectToInternet,
            from: "",
          };
          HomePage.hitokoto = hk;
          this.setState({ hitokoto: hk });
        } else {
          HomePage.hitokoto = hk;
          this.setState({ hitokoto: hk });
        }
      });
    }
  };
  // handle minecraft profile select
  handleChange = (val: string): void => {
    const newValue = +val;
    setConfig((cfg) => cfg.profiles.select(cfg.profiles[newValue]));
    logger.info(`Profile selection changed to id ${newValue}`);
    this.setState({ value: newValue });
  };
  handleLaunch = (): void => {
    // value will be "" if not selected
    const val = Number(this.state.value);
    const account = this.account;
    const profile = ephConfigs.profiles[val];
    if (account && profile) {
      HomePage.setStaticState({
        isLaunching: !HomePage.staticState.isLaunching,
      });
      launchMinecraft({
        account,
        profile,
        setHelper: (helper) =>
          HomePage.setStaticState({ launchingHelper: helper }),
        java: ephConfigs.javas.getSelected(),
        onDone: () => {
          HomePage.setStaticState({ isLaunching: false });
        },
        requestPassword: (again: boolean) =>
          new Promise((resolve) => {
            if (again !== this.state.againRequestPassword) {
              this.setState({
                againRequestPassword: again,
              });
            }
            showDialog((close) => (
              <RequestPasswordDialog
                onClose={close}
                again={this.state.againRequestPassword}
                callback={(password: string) => {
                  resolve(password);
                }}
              />
            ));
          }),
      }).catch((err: Error) => {
        showDialog((close) => (
          <ErrorDialog onClose={close} stacktrace={err.stack ?? " "} />
        ));
      });
    } else {
      showDialog((close) => (
        <AlertDialog
          title={t.warning}
          message={t.noAccOrProSelected}
          close={close}
        />
      ));
    }
  };
  render(): JSX.Element {
    const profiles = ephConfigs.profiles;
    const username = this.account?.name;
    return (
      <Container>
        <Card className="my-3 p-6 shadow-sm">
          <div className="flex">
            <div className="p-3 flex-grow">
              <p className="text-shallow mt-0">{t.hello}</p>
              <Typography className="text-2xl">
                {username === undefined ? t.noAccSelected : username}
              </Typography>
              {this.enableHitokoto && (
                <div>
                  <Typography className="text-sm">
                    {this.state.hitokoto.content}
                  </Typography>
                  <Typography className="text-sm text-shallow">
                    {this.state.hitokoto.from}
                  </Typography>
                </div>
              )}
            </div>
            <div>
              <IconButton onClick={() => hist.push("processes")}>
                <MdViewCarousel />
              </IconButton>
              <IconButton onClick={() => hist.push("extensions")}>
                <MdApps />
              </IconButton>
            </div>
          </div>
          <div className="flex">
            <Button onClick={() => hist.push("accounts")}>
              <MdAccountCircle /> {t.accounts}
            </Button>
            <Button onClick={() => hist.push("profiles")}>
              <MdGamepad /> {t.profiles}
            </Button>
            <div className="flex-grow" />
            {this.enableHitokoto && (
              <IconButton onClick={this.reloadHitokoto}>
                <MdRefresh />
              </IconButton>
            )}
            <IconButton onClick={() => hist.push("settings")}>
              <MdSettings />
            </IconButton>
          </div>
        </Card>
        <div className="flex space-x-6">
          <Card className="flex-grow">
            {profiles.length === 0 ? (
              <Typography className="text-sm p-1 m-1">
                {t.noProSelected}
              </Typography>
            ) : (
              <Select
                value={this.state.value}
                onChange={this.handleChange}
                disabled={HomePage.staticState.isLaunching}
              >
                {profiles.map((i: MinecraftProfile, index) => (
                  <option key={index} value={index}>
                    {i.name}
                  </option>
                ))}
              </Select>
            )}
            <Button
              onClick={this.handleLaunch}
              disabled={HomePage.staticState.isLaunching}
            >
              <MdPlayArrow />
              {t.launch}
            </Button>
            {HomePage.staticState.isLaunching && (
              <>
                <Typography className="text-sm">
                  {HomePage.staticState.launchingHelper}
                </Typography>
                <div className="bg-blue-500 rounded-full h-1 animate-pulse" />
              </>
            )}
          </Card>
          <Card className="flex-grow">
            <Typography className="text-xl font-semibold">{t.news}</Typography>
            <Typography>{t.notSupportedYet}</Typography>
          </Card>
        </div>
      </Container>
    );
  }
}
