import {
  Select,
  Button,
  IconButton,
  TextField,
  TinyButton,
  Link,
} from "../components/inputs";
import { useEffect, useMemo, useState } from "react";
import { configStore, setConfig } from "common/struct/config";
import { LaunchCanceller, launchMinecraft } from "core/launch";
import { fetchHitokoto, Hitokoto } from "common/struct/hitokoto";
import { Card } from "../components/layouts";
import {
  MdAccountCircle,
  MdApps,
  MdClose,
  MdGamepad,
  MdMoreHoriz,
  MdPlayArrow,
  MdRefresh,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";
import { showOverlay } from "../overlay";
import { t } from "../intl";
import { _ } from "common/utils/arrays";
import { action, makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import ProgressBar from "../components/ProgressBar";
import NewsView from "./NewsView";
import { fetchNews, NewItem } from "../../common/struct/news";
import { JavaManagementSheet } from "./SettingsPage";
import { ObjectWrapper } from "common/utils/object";
import { pushToHistory } from "eph/renderer/history";
import { DefaultFn } from "common/utils";
import ExtensionView from "./ExtensionView";
import { MinecraftAccount } from "common/struct/accounts";
import { MinecraftProfile } from "common/struct/profiles";

export function RequestPasswordDialog(props: {
  again: boolean;
  password: string;
  onChangePassword: (ev: string) => unknown;
}): JSX.Element {
  return (
    <TextField
      value={props.password}
      onChange={props.onChangePassword}
      label={t("password")}
      type="password"
      helperText={props.again ? t("account.wrongPassword") : ""}
      error={props.again}
    />
  );
}

export class HomePageStore {
  @observable isLaunching = false;
  @observable launchingHelper = "";
  @observable hitokoto: Hitokoto = { content: "", from: "" };
  // empty array: not loaded yet; null: loading; undefined: error occurred;
  @observable news: NewItem[] | null | undefined = [];
  againRequestingPassword = false;
  canceller = new ObjectWrapper<LaunchCanceller>(() => false);
  password = new ObjectWrapper<string>("");
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
      runInAction(() => {
        this.hitokoto = hk ?? {
          content: t("internetNotAvailable"),
          from: "",
        };
      })
    );
  };
  @action
  reloadNews = (): void => {
    this.news = null;
    fetchNews().then((news) =>
      runInAction(() => (this.news = news ?? undefined))
    );
  };
  again = (): void => {
    this.againRequestingPassword = true;
  };
  launch = (
    current: MinecraftAccount | undefined,
    profile: MinecraftProfile
  ): void => {
    if (current && profile) {
      this.setLaunching(true);
      launchMinecraft({
        account: current,
        profile,
        setHelper: this.setLaunchHelper,
        java:
          configStore.javas.find((val) => val.nanoid === profile.java) ??
          _.selected(configStore.javas),
        onDone: (process) => {
          this.setLaunching(false);
          if (process && process.crash) {
            // show crash report
            showOverlay({
              title: t("launching.crashReport"),
              message: t("launching.crashReport.helper"),
            });
          }
        },
        requestPassword: (again: boolean) =>
          new Promise((resolve) => {
            if (again !== this.againRequestingPassword) {
              this.again();
            }
            this.password.current = "";
            showOverlay({
              title: t("account.inputPassword"),
              content: RequestPasswordDialog,
              cancellable: () => this.setLaunching(false),
              params: {
                again: this.againRequestingPassword,
                password: this.password.current,
                onChangePassword: (ev) => (this.password.current = ev),
              },
              action: () => resolve(this.password.current),
            });
          }),
        cancellerWrapper: this.canceller,
        provider: configStore.downloadProvider,
      })
        .then(([stat, cb]) => {
          if (stat === "jRequired") {
            showNoJavaDialog();
          } else if (stat === "j8Required" && cb) {
            showJava8RequiredDialog(cb);
          } else if (stat === "j16Required" && cb) {
            showJava16RequiredDialog(cb);
          } else if (stat === "j17Required" && cb) {
            showJava17RequiredDialog(cb);
          }
        })
        .catch((err: Error) => {
          showOverlay({
            title: t("errorOccurred"),
            message: err.stack ?? t("errorOccurred"),
          });
          this.setLaunching(false);
        });
    } else {
      showOverlay({
        title: t("warning"),
        message: t("launching.noAccOrProSelected"),
      });
    }
  };
  cancel = (): void => {
    this.canceller.current() && this.setLaunching(false);
  };
}

export const homePageStore = new HomePageStore();

const HomePage = observer(() => {
  const account = useMemo(() => _.selected(configStore.accounts), []);
  const profiles = configStore.profiles;
  const [value, setValue] = useState<number | null>(
    _.selectedIndex(configStore.profiles) ?? null
  );
  const profile = value !== null && configStore.profiles[+value];

  const handleChange = (val: string) => {
    const newValue = +val;
    setValue(newValue);
    setConfig(() => _.selectByIndex(profiles, newValue));
  };

  useEffect(() => {
    if (configStore.hitokoto && !homePageStore.hitokoto.content) {
      homePageStore.reloadHitokoto();
    }
    if (homePageStore.news?.length === 0) {
      homePageStore.reloadNews();
    }
  }, []);

  return (
    <div className="px-5">
      <Card className="my-3 p-9 shadow-sm">
        <div className="flex">
          <div className="p-3 flex-grow">
            <p className="text-shallow mt-0">{t("hello")}</p>
            <p className="text-2xl">
              {account?.name ?? t("account.notSelected")}
            </p>
            {configStore.hitokoto && (
              <div>
                <p className="text-sm">{homePageStore.hitokoto.content}</p>
                <p className="text-sm text-shallow">
                  {homePageStore.hitokoto.from}
                </p>
              </div>
            )}
          </div>
          <div>
            <IconButton onClick={() => pushToHistory("processes")}>
              <MdViewCarousel />
            </IconButton>
            <IconButton
              onClick={() =>
                showOverlay({
                  type: "sheet",
                  title: t("extensions"),
                  content: ExtensionView,
                })
              }
            >
              <MdApps />
            </IconButton>
          </div>
        </div>
        <div className="flex">
          <Button onClick={() => pushToHistory("accounts")}>
            <MdAccountCircle /> {t("accounts")}
          </Button>
          <Button onClick={() => pushToHistory("profiles")}>
            <MdGamepad /> {t("profiles")}
          </Button>
          <div className="flex-grow" />
          {configStore.hitokoto && (
            <IconButton onClick={homePageStore.reloadHitokoto}>
              <MdRefresh />
            </IconButton>
          )}
          <IconButton onClick={() => pushToHistory("settings")}>
            <MdSettings />
          </IconButton>
        </div>
      </Card>
      <div className="flex space-x-6">
        <Card className="w-1/2 flex flex-col p-3">
          <div className="flex flex-col flex-grow justify-center">
            {profile && value !== null ? (
              <>
                <Select
                  value={value}
                  onChange={handleChange}
                  disabled={homePageStore.isLaunching}
                  className="overflow-ellipsis mb-1"
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
                  {homePageStore.isLaunching ? (
                    <Button onClick={homePageStore.cancel}>
                      <MdClose />
                      {t("cancel")}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        homePageStore.launch(account, profile);
                      }}
                    >
                      <MdPlayArrow />
                      {t("launch")}
                    </Button>
                  )}
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
              onClick={() =>
                showOverlay({
                  type: "sheet",
                  title: t("java.manage"),
                  content: JavaManagementSheet,
                })
              }
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
        <Card className="w-1/2 flex flex-col p-3">
          <p className="text-xl font-semibold mb-1">{t("news")}</p>
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
              onClick={() =>
                showOverlay({
                  type: "sheet",
                  title: t("news"),
                  content: NewsView,
                })
              }
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
    </div>
  );
});

export function showJava16RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay({
    title: t("warning"),
    message: t("launching.considerUsingJava16"),
    positiveText: t("continueAnyway"),
    dangerous: true,
    cancellable: true,
    action: finallyRun,
  });
}

export function showJava17RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay({
    title: t("warning"),
    message: t("launching.considerUsingJava17"),
    positiveText: t("continueAnyway"),
    dangerous: true,
    cancellable: true,
    fineCancel: true,
    action: finallyRun,
    bottomDivide: true,
    neutral: {
      text: t("java.installJava"),
      action: () => pushToHistory("java.installJava"),
    },
  });
}

export function showJava8RequiredDialog(finallyRun: DefaultFn): void {
  showOverlay({
    title: t("warning"),
    message: t("launching.considerUsingJava8"),
    positiveText: t("continueAnyway"),
    dangerous: true,
    cancellable: true,
    fineCancel: true,
    action: finallyRun,
    bottomDivide: true,
    neutral: {
      text: t("java.installJava"),
      action: () => pushToHistory("java.installJava"),
    },
  });
}

export function showNoJavaDialog(): void {
  showOverlay({
    title: t("launching.javaNotFound"),
    message: t("launching.javaNotFoundMessage"),
    cancellable: true,
    fineCancel: true,
    positiveText: t("java.installJava"),
    action: () => pushToHistory("java.installJava"),
    bottomDivide: true,
  });
}

export default HomePage;
