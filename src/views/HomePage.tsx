import { Select, Button, IconButton, TextField } from "../components/inputs";
import { Component, useState } from "react";
import { logger } from "../renderer/global";
import { configStore, setConfig } from "../struct/config";
import { MinecraftAccount } from "../struct/accounts";
import { MinecraftProfile } from "../struct/profiles";
import { launchMinecraft } from "../core";
import { DefaultFn, EmptyObject } from "../tools";
import { fetchHitokoto, Hitokoto } from "../struct/hitokoto";
import { Card, Typography, Container } from "../components/layouts";
import Dialog, { AlertDialog, ErrorDialog } from "../components/Dialog";
import {
  MdAccountCircle,
  MdApps,
  MdGamepad,
  MdPlayArrow,
  MdRefresh,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";
import { showDialog } from "../renderer/overlays";
import { t } from "../intl";
import { historyStore } from "../renderer/history";
import { _ } from "../tools/arrays";
import { makeObservable, observable } from "mobx";
import { Observer } from "mobx-react";

export function RequestPasswordDialog(props: {
  again: boolean;
  onClose: DefaultFn;
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
        {t("pleaseInputPassword")}
      </Typography>
      <div>
        <TextField
          value={password}
          onChange={setPassword}
          label={t("password")}
          type="password"
          helperText={props.again ? t("passwordWrong") : ""}
          error={props.again}
        />
      </div>
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={props.onClose}>
          {t("cancel")}
        </Button>
        <Button onClick={handler}>{t("ok")}</Button>
      </div>
    </Dialog>
  );
}

export class HomePageStore {
  @observable isLaunching = false;
  @observable launchingHelper = "";
  @observable hitokoto: Hitokoto = { content: "...", from: "..." };
  @observable value: number | string = "";
  @observable againRequestingPassword = false;
  constructor() {
    makeObservable(this);
  }
}

export const homePageStore = new HomePageStore();

export default class HomePage extends Component {
  account: MinecraftAccount | undefined;
  enableHitokoto = configStore.hitokoto;
  constructor(props: EmptyObject) {
    super(props);
    this.account = _.selected(configStore.accounts);
    homePageStore.value = _.selectedIndex(configStore.profiles) ?? "";
  }
  componentDidMount(): void {
    this.enableHitokoto = configStore.hitokoto;
  }
  reloadHitokoto = (): void => {
    if (this.enableHitokoto) {
      this.setState({ hitokoto: { content: "...", from: "..." } });
      fetchHitokoto().then((hk) => {
        if (hk === null) {
          const hk: Hitokoto = {
            content: t("cannotConnectToInternet"),
            from: "",
          };
          homePageStore.hitokoto = hk;
        } else {
          homePageStore.hitokoto = hk;
        }
      });
    }
  };
  // handle minecraft profile select
  handleChange = (val: string): void => {
    const newValue = +val;
    setConfig((cfg) => _.select(cfg.profiles, cfg.profiles[newValue]));
    homePageStore.value = newValue;
    logger.info(`Profile selection changed to id ${newValue}`);
  };
  handleLaunch = (): void => {
    // value will be "" if not selected
    const val = +homePageStore.value;
    const account = this.account;
    const profile = configStore.profiles[val];
    if (account && profile) {
      homePageStore.isLaunching = true;
      launchMinecraft({
        account,
        profile,
        setHelper: (helper) => (homePageStore.launchingHelper = helper),
        java: _.selected(configStore.javas),
        onDone: () => (homePageStore.isLaunching = false),
        requestPassword: (again: boolean) =>
          new Promise((resolve) => {
            if (again !== homePageStore.againRequestingPassword) {
              this.setState({
                againRequestPassword: again,
              });
            }
            showDialog((close) => (
              <RequestPasswordDialog
                onClose={close}
                again={homePageStore.againRequestingPassword}
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
          title={t("warning")}
          message={t("noAccOrProSelected")}
          close={close}
        />
      ));
    }
  };
  render(): JSX.Element {
    const profiles = configStore.profiles;
    const username = this.account?.name;
    return (
      <Observer>
        {() => (
          <Container>
            <Card className="my-3 p-6 shadow-sm">
              <div className="flex">
                <div className="p-3 flex-grow">
                  <p className="text-shallow mt-0">{t("hello")}</p>
                  <Typography className="text-2xl">
                    {username === undefined ? t("noAccSelected") : username}
                  </Typography>
                  {this.enableHitokoto && (
                    <div>
                      <Typography className="text-sm">
                        {homePageStore.hitokoto.content}
                      </Typography>
                      <Typography className="text-sm text-shallow">
                        {homePageStore.hitokoto.from}
                      </Typography>
                    </div>
                  )}
                </div>
                <div>
                  <IconButton onClick={() => historyStore.push("processes")}>
                    <MdViewCarousel />
                  </IconButton>
                  <IconButton onClick={() => historyStore.push("extensions")}>
                    <MdApps />
                  </IconButton>
                </div>
              </div>
              <div className="flex">
                <Button onClick={() => historyStore.push("accounts")}>
                  <MdAccountCircle /> {t("accounts")}
                </Button>
                <Button onClick={() => historyStore.push("profiles")}>
                  <MdGamepad /> {t("profiles")}
                </Button>
                <div className="flex-grow" />
                {this.enableHitokoto && (
                  <IconButton onClick={this.reloadHitokoto}>
                    <MdRefresh />
                  </IconButton>
                )}
                <IconButton onClick={() => historyStore.push("settings")}>
                  <MdSettings />
                </IconButton>
              </div>
            </Card>
            <div className="flex space-x-6">
              <Card className="flex-grow">
                {profiles.length === 0 ? (
                  <Typography className="text-sm p-1 m-1">
                    {t("noProSelected")}
                  </Typography>
                ) : (
                  <Select
                    value={homePageStore.value}
                    onChange={this.handleChange}
                    disabled={homePageStore.isLaunching}
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
                  disabled={homePageStore.isLaunching}
                >
                  <MdPlayArrow />
                  {t("launch")}
                </Button>
                {homePageStore.isLaunching && (
                  <>
                    <Typography className="text-sm">
                      {homePageStore.launchingHelper}
                    </Typography>
                    <div className="bg-blue-500 rounded-full h-1 animate-pulse" />
                  </>
                )}
              </Card>
              <Card className="flex-grow">
                <Typography className="text-xl font-semibold">
                  {t("news")}
                </Typography>
                <Typography>{t("notSupportedYet")}</Typography>
              </Card>
            </div>
          </Container>
        )}
      </Observer>
    );
  }
}
