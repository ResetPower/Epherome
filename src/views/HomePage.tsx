import { Select, Button, IconButton, TextField } from "../components/inputs";
import { useState } from "react";
import { configStore, setConfig } from "../struct/config";
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
import { showOverlay } from "../renderer/overlays";
import { t } from "../intl";
import { historyStore } from "../renderer/history";
import { _ } from "../tools/arrays";
import { action, makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react";
import { useRef } from "react";
import ProgressBar from "../components/ProgressBar";
import ExtensionsView from "./ExtensionsView";

export function RequestPasswordDialog(props: {
  again: boolean;
  onClose: DefaultFn;
  onCancel: DefaultFn;
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
        {t("account.inputPassword")}
      </Typography>
      <div>
        <TextField
          value={password}
          onChange={setPassword}
          label={t("password")}
          type="password"
          helperText={props.again ? t("account.wrongPassword") : ""}
          error={props.again}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className="text-shallow"
          onClick={() => {
            props.onCancel();
            props.onClose();
          }}
        >
          {t("cancel")}
        </Button>
        <Button onClick={handler}>{t("fine")}</Button>
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
            content: t("internetNotAvailable"),
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
  const account = useRef(_.selected(configStore.accounts));
  const profiles = configStore.profiles;
  const username = account.current?.name;
  const isHitokotoEnabled = configStore.hitokoto;
  const [value, setValue] = useState<number | null>(
    _.selectedIndex(configStore.profiles) ?? null
  );

  const handleChange = (val: string) => {
    const newValue = +val;
    setValue(newValue);
    setConfig(() => _.selectByIndex(profiles, newValue));
  };
  const handleLaunch = () => {
    // value will be "" if not selected
    const current = account.current;
    const profile = value !== null && configStore.profiles[+value];
    if (current && profile) {
      homePageStore.setLaunching(true);
      launchMinecraft({
        account: current,
        profile,
        setHelper: homePageStore.setLaunchHelper,
        java:
          configStore.javas.find((val) => val.nanoid === profile.java) ??
          _.selected(configStore.javas),
        onDone: () => homePageStore.setLaunching(false),
        requestPassword: (again: boolean) =>
          new Promise((resolve) => {
            if (again !== homePageStore.againRequestingPassword) {
              homePageStore.again();
            }
            showOverlay((close) => (
              <RequestPasswordDialog
                onClose={close}
                onCancel={() => homePageStore.setLaunching(false)}
                again={homePageStore.againRequestingPassword}
                callback={(password: string) => {
                  resolve(password);
                }}
              />
            ));
          }),
      }).catch((err: Error) => {
        showOverlay((close) => (
          <ErrorDialog onClose={close} stacktrace={err.stack ?? " "} />
        ));
        homePageStore.setLaunching(false);
      });
    } else {
      showOverlay((close) => (
        <AlertDialog
          title={t("warning")}
          message={t("launching.noAccOrProSelected")}
          close={close}
        />
      ));
    }
  };

  if (isHitokotoEnabled && !homePageStore.hitokoto.content) {
    homePageStore.reloadHitokoto();
  }

  return (
    <Container>
      <Card className="my-3 p-6 shadow-sm">
        <div className="flex">
          <div className="p-3 flex-grow">
            <p className="text-shallow mt-0">{t("hello")}</p>
            <Typography className="text-2xl">
              {username === undefined ? t("account.notSelected") : username}
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
            <IconButton
              onClick={() => {
                showOverlay(
                  (close) => <ExtensionsView close={close} />,
                  "sheet",
                  "slide"
                );
              }}
            >
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
        <Card className="w-1/2">
          {value === null ? (
            <Typography className="text-sm p-1 m-1">
              {t("profile.notSelected")}
            </Typography>
          ) : (
            <Select
              value={value}
              onChange={handleChange}
              disabled={homePageStore.isLaunching}
              className="overflow-ellipsis"
            >
              {_.map(profiles, (i, id) => (
                <option key={id} value={id}>
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
              <ProgressBar unlimited />
            </>
          )}
        </Card>
        <Card className="w-1/2">
          <Typography className="text-xl font-semibold">{t("news")}</Typography>
          <Typography>{t("notSupportedYet")}</Typography>
        </Card>
      </div>
    </Container>
  );
});

export default HomePage;
