import {
  Select,
  Button,
  IconButton,
  TextField,
  TinyButton,
  Link,
} from "../components/inputs";
import { useState } from "react";
import { configStore, setConfig } from "common/struct/config";
import { launchMinecraft } from "core/launch";
import { DefaultFn } from "common/utils";
import { fetchHitokoto, Hitokoto } from "common/struct/hitokoto";
import { Card, Container } from "../components/layouts";
import Dialog, { AlertDialog, ErrorDialog } from "../components/Dialog";
import {
  MdAccountCircle,
  MdApps,
  MdGamepad,
  MdMoreHoriz,
  MdPlayArrow,
  MdRefresh,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";
import { showOverlay, useOverlayCloser } from "../renderer/overlays";
import { t } from "../intl";
import { historyStore } from "../renderer/history";
import { _ } from "common/utils/arrays";
import { action, makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react";
import { useRef } from "react";
import ProgressBar from "../components/ProgressBar";
import ExtensionsView from "./ExtensionsView";
import NewsView from "./NewsView";
import { fetchNews, NewItem } from "common/struct/news";
import { JavaManagementDialog } from "./SettingsPage";
import {
  showJava16RequiredDialog,
  showJava8RequiredDialog,
  showNoJavaDialog,
} from "eph/renderer/alerts";

export function RequestPasswordDialog(props: {
  again: boolean;
  onCancel: DefaultFn;
  callback: (password: string) => void;
}): JSX.Element {
  const close = useOverlayCloser();
  const [password, setPassword] = useState("");
  const handler = () => {
    close();
    props.callback(password);
  };

  return (
    <Dialog indentBottom>
      <p className="text-xl font-semibold">{t("account.inputPassword")}</p>
      <div>
        <TextField
          value={password}
          onChange={setPassword}
          label={t("password")}
          type="password"
          helperText={props.again ? t("account.wrongPassword") : ""}
          error={props.again}
          onEnter={handler}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className="text-shallow"
          onClick={() => {
            props.onCancel();
            close();
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
  // empty array: not loaded yet; null: loading; undefined: error occurred;
  @observable news: NewItem[] | null | undefined = [];
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
  reloadNews = (): void => {
    this.news = null;
    fetchNews()
      .then((news) => runInAction(() => (this.news = news)))
      .catch(() => runInAction(() => (this.news = undefined)));
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
  const isHitokotoEnabled = configStore.hitokoto;
  const [value, setValue] = useState<number | null>(
    _.selectedIndex(configStore.profiles) ?? null
  );
  const profile = value !== null && configStore.profiles[+value];

  const handleChange = (val: string) => {
    const newValue = +val;
    setValue(newValue);
    setConfig(() => _.selectByIndex(profiles, newValue));
  };
  const handleLaunch = () => {
    // value will be "" if not selected
    const current = account.current;
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
            showOverlay(
              <RequestPasswordDialog
                onCancel={() => homePageStore.setLaunching(false)}
                again={homePageStore.againRequestingPassword}
                callback={(password: string) => {
                  resolve(password);
                }}
              />
            );
          }),
      })
        .then(([stat, cb]) => {
          if (stat === "jRequired") {
            showNoJavaDialog();
          } else if (stat === "j8Required" && cb) {
            showJava8RequiredDialog(cb);
          } else if (stat === "j16Required" && cb) {
            showJava16RequiredDialog(cb);
          }
        })
        .catch((err: Error) => {
          showOverlay(<ErrorDialog stacktrace={err.stack ?? " "} />);
          homePageStore.setLaunching(false);
        });
    } else {
      showOverlay(
        <AlertDialog
          title={t("warning")}
          message={t("launching.noAccOrProSelected")}
        />
      );
    }
  };

  if (isHitokotoEnabled && !homePageStore.hitokoto.content) {
    homePageStore.reloadHitokoto();
  }
  if (homePageStore.news?.length === 0) {
    homePageStore.reloadNews();
  }

  return (
    <Container>
      <Card className="my-3 p-6 shadow-sm">
        <div className="flex">
          <div className="p-3 flex-grow">
            <p className="text-shallow mt-0">{t("hello")}</p>
            <p className="text-2xl">
              {account.current?.name ?? t("account.notSelected")}
            </p>
            {isHitokotoEnabled && (
              <div>
                <p className="text-sm">{homePageStore.hitokoto.content}</p>
                <p className="text-sm text-shallow">
                  {homePageStore.hitokoto.from}
                </p>
              </div>
            )}
          </div>
          <div>
            <IconButton onClick={() => historyStore.push("processes")}>
              <MdViewCarousel />
            </IconButton>
            <IconButton
              onClick={() => {
                showOverlay(<ExtensionsView />, "sheet", "slide");
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
        <Card className="w-1/2 flex flex-col">
          <div className="flex flex-grow flex-col justify-center">
            {profile && value !== null ? (
              <>
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
                <div className="flex space-x-3 p-1">
                  <p className="text-shallow">{t("version")}</p>
                  <p>{profile.ver}</p>
                </div>
                <div>
                  <Button
                    onClick={handleLaunch}
                    disabled={homePageStore.isLaunching}
                  >
                    <MdPlayArrow />
                    {homePageStore.isLaunching ? t("launching") : t("launch")}
                  </Button>
                </div>
              </>
            ) : (
              <p className="p-1 m-auto text-shallow">
                {t("profile.notSelected")}
              </p>
            )}
            {homePageStore.isLaunching && (
              <>
                <p className="text-sm">{homePageStore.launchingHelper}</p>
                <ProgressBar unlimited />
              </>
            )}
          </div>
          <div className="border-t border-divider text-contrast flex">
            <TinyButton
              className="px-1"
              onClick={() => showOverlay(<JavaManagementDialog />)}
            >
              {t("java.manage")}
            </TinyButton>
            <div className="flex-grow" />
            <p className="text-shallow">
              {t("java.default")}:{" "}
              {_.selected(configStore.javas)?.name ?? t("haveNot")}
            </p>
          </div>
        </Card>
        <Card className="w-1/2 flex flex-col">
          <p className="text-xl font-semibold">{t("news")}</p>
          {homePageStore.news === null ? (
            <p>
              ...
              <br />
              <br />
            </p>
          ) : homePageStore.news === undefined ? (
            <p>
              {t("internetNotAvailable")}
              <br />
              <br />
            </p>
          ) : (
            homePageStore.news
              .slice(0, 2)
              .map((val, index) => <p key={index}>{val.title}</p>)
          )}
          <div>
            <TinyButton
              onClick={() => showOverlay(<NewsView />, "sheet", "slide")}
              paddingRight
            >
              <MdMoreHoriz /> {t("expand")}
            </TinyButton>
          </div>
          <div className="flex-grow" />
          <div className="flex border-t border-divider p-1">
            <MdRefresh
              className="cursor-pointer text-contrast"
              onClick={homePageStore.reloadNews}
            />
            <div className="flex-grow" />
            <Link href="https://www.mcbbs.net">MCBBS</Link>
          </div>
        </Card>
      </div>
    </Container>
  );
});

export default HomePage;
