import { Select, Button, IconButton, TextField } from "../components/inputs";
import { useCallback, useState } from "react";
import { logger } from "../renderer/global";
import { configStore, setConfig } from "../struct/config";
import { MinecraftProfile } from "../struct/profiles";
import { launchMinecraft } from "../core";
import { DefaultFn } from "../tools";
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
import { action, makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react";
import { useRef } from "react";

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
  @observable hitokoto: Hitokoto = { content: "", from: "" };
  @observable againRequestingPassword = false;
  constructor() {
    makeObservable(this);
  }
  @action
  setLaunching = (launching: boolean): void => {
    this.isLaunching = launching;
  };
  @action
  setLaunchHelper = (helper: string): void => {
    this.launchingHelper = helper;
  };
  @action
  reloadHitokoto = (): void => {
    this.hitokoto = { content: "...", from: "..." };
    fetchHitokoto().then((hk) =>
      runInAction(
        () =>
          (this.hitokoto = hk ?? {
            content: t("cannotConnectToInternet"),
            from: "",
          })
      )
    );
  };
  @action
  again = (): void => {
    this.againRequestingPassword = true;
  };
}

export const homePageStore = new HomePageStore();

const HomePage = observer(() => {
  const isHitokotoEnabled = configStore.hitokoto;
  const account = useRef(_.selected(configStore.accounts));
  const [value, setValue] = useState(
    _.selectedIndex(configStore.profiles) ?? ""
  );
  const handleChange = useCallback((val: string): void => {
    const newValue = +val;
    setConfig((cfg) => _.select(cfg.profiles, cfg.profiles[newValue]));
    setValue(newValue);
    logger.info(`Profile selection changed to id ${newValue}`);
  }, []);
  const handleLaunch = useCallback(() => {
    // value will be "" if not selected
    const val = +value;
    const current = account.current;
    const profile = configStore.profiles[val];
    if (current && profile) {
      homePageStore.setLaunching(true);
      launchMinecraft({
        account: current,
        profile,
        setHelper: homePageStore.setLaunchHelper,
        java: _.selected(configStore.javas),
        onDone: () => homePageStore.setLaunching(false),
        requestPassword: (again: boolean) =>
          new Promise((resolve) => {
            if (again !== homePageStore.againRequestingPassword) {
              homePageStore.again();
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
  }, [value]);

  if (isHitokotoEnabled && !homePageStore.hitokoto.content) {
    homePageStore.reloadHitokoto();
  }

  const profiles = configStore.profiles;
  const username = account.current?.name;
  return (
    <Container>
      <Card className="my-3 p-6 shadow-sm">
        <div className="flex">
          <div className="p-3 flex-grow">
            <p className="text-shallow mt-0">{t("hello")}</p>
            <Typography className="text-2xl">
              {username === undefined ? t("noAccSelected") : username}
            </Typography>
            {isHitokotoEnabled && (
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
          {isHitokotoEnabled && (
            <IconButton onClick={homePageStore.reloadHitokoto}>
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
              value={value}
              onChange={handleChange}
              disabled={homePageStore.isLaunching}
            >
              {profiles.map((i: MinecraftProfile, index) => (
                <option key={index} value={index}>
                  {i.name}
                </option>
              ))}
            </Select>
          )}
          <Button onClick={handleLaunch} disabled={homePageStore.isLaunching}>
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
          <Typography className="text-xl font-semibold">{t("news")}</Typography>
          <Typography>{t("notSupportedYet")}</Typography>
        </Card>
      </div>
    </Container>
  );
});

export default HomePage;
