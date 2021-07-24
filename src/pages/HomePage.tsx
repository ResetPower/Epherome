import { Select, Button, IconButton, TextField } from "../components/inputs";
import { Component, useCallback } from "react";
import { hist, logger } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { getAccount, MinecraftAccount } from "../struct/accounts";
import { getProfile, MinecraftProfile } from "../struct/profiles";
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
import GlobalOverlay from "../components/GlobalOverlay";
import { ErrorDialog } from "../components/Dialogs";
import { useController } from "../tools/hooks";
import { getById } from "../tools";

export function RequestPasswordDialog(props: {
  again: boolean;
  onClose: DefaultFunction;
  callback: (password: string) => void;
}): JSX.Element {
  const passwordController = useController("");
  const handler = useCallback(() => {
    props.onClose();
    props.callback(passwordController.value);
  }, [passwordController, props]);

  return (
    <Dialog indentBottom>
      <Typography className="text-xl font-semibold">{t.pleaseInputPassword}</Typography>
      <div>
        <TextField
          {...passwordController}
          label={t.password}
          type="password"
          helperText={props.again ? t.passwordWrong : ""}
          error={props.again}
        />
      </div>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={props.onClose} textInherit>
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
  isLaunching: boolean;
  launchingHelper: string;
}

export default class HomePage extends Component<EmptyObject, HomePageState> {
  state: HomePageState = {
    details: [],
    value: "",
    hitokoto: { content: "...", from: "..." },
    againRequestPassword: false,
    isLaunching: false,
    launchingHelper: "",
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
    const newValue = parseInt(val);
    setConfig({ selectedProfile: newValue });
    logger.info(`Profile selection changed to id ${newValue}`);
    this.setState({ value: newValue });
  };
  handleLaunch = (): void => {
    // value will be "" if not selected
    const val = Number(this.state.value);
    const account = this.account;
    const profile = getProfile(val);
    if (account !== null && profile !== null) {
      this.setState((prev) => ({ isLaunching: !prev.isLaunching }));
      launchMinecraft({
        account,
        profile,
        setHelper: (helper) => this.setState({ launchingHelper: helper }),
        java: getById(ephConfigs.javas, ephConfigs.selectedJava),
        onDone: () => {
          this.setState({ isLaunching: false });
        },
        requestPassword: (again: boolean) =>
          new Promise((resolve) => {
            if (again !== this.state.againRequestPassword) {
              this.setState({
                againRequestPassword: again,
              });
            }
            GlobalOverlay.showDialog((close) => (
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
        GlobalOverlay.showDialog((close) => (
          <ErrorDialog onClose={close} stacktrace={err.stack ?? " "} />
        ));
      });
    } else {
      GlobalOverlay.showDialog((close) => (
        <AlertDialog title={t.warning} message={t.noAccOrProSelected} close={close} />
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
                  <Typography className="text-sm">{this.state.hitokoto.content}</Typography>
                  <Typography className="text-sm text-shallow" textInherit>
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
              <Typography className="text-sm p-1 m-1">{t.noProSelected}</Typography>
            ) : (
              <Select
                value={this.state.value}
                onChange={this.handleChange}
                disabled={this.state.isLaunching}
              >
                {profiles.map((i: MinecraftProfile) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </Select>
            )}
            <Button onClick={this.handleLaunch} disabled={this.state.isLaunching}>
              <MdPlayArrow />
              {t.launch}
            </Button>
            {this.state.isLaunching && (
              <>
                <Typography className="text-sm">{this.state.launchingHelper}</Typography>
                <div className="bg-blue-500 rounded-full h-1 animate-pulse"></div>
              </>
            )}
          </Card>
          <Card className="flex-grow">
            <Typography className="text-xl font-semibold">{t.warning}</Typography>
            <Typography>{t.alphaWarning}</Typography>
          </Card>
        </div>
      </Container>
    );
  }
}
