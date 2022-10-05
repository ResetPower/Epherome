import {
  Select,
  Button,
  IconButton,
  TextField,
  BadgeButton,
} from "@resetpower/rcs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { configStore, FnBoardPlacement, setConfig } from "common/struct/config";
import { launchMinecraft } from "core/launch";
import { fetchHitokoto, Hitokoto } from "common/struct/hitokoto";
import {
  MdAccountCircle,
  MdApps,
  MdGamepad,
  MdMoreVert,
  MdRefresh,
  MdSettings,
  MdViewCarousel,
} from "react-icons/md";
import { showOverlay } from "../overlay";
import { KeyOfLanguageDefinition, t } from "../intl";
import { _ } from "common/utils/arrays";
import { action, makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import NewsView from "./NewsView";
import { fetchNews, NewItem } from "../../common/struct/news";
import { JavaManagementSheet } from "./SettingsPage";
import { ObjectWrapper } from "common/utils/object";
import { historyStore } from "eph/renderer/history";
import { apply, DefaultFn } from "common/utils";
import { MinecraftAccount } from "common/struct/accounts";
import { MinecraftProfile } from "common/struct/profiles";
import { Canceller } from "common/task/cancel";
import { BsServer } from "react-icons/bs";
import ShadowText from "eph/components/ShadowText";

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

const MetroCardContext = createContext(false);

function MetroCard(props: {
  icon: ReactNode;
  target: KeyOfLanguageDefinition;
  className: string;
}) {
  const enableBg = useContext(MetroCardContext);

  return (
    <div
      className={`${props.className} ${
        enableBg && "bg-opacity-50"
      } rounded text-white flex items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer select-none p-3 space-x-3`}
      onClick={() => historyStore.push(props.target)}
      style={
        enableBg
          ? {
              backdropFilter: "blur(10px)",
            }
          : {}
      }
    >
      <div className="text-2xl">{props.icon}</div>
      {!enableBg && <div>{t(props.target)}</div>}
    </div>
  );
}

export class HomePageStore {
  @observable isLaunching = false;
  @observable launchingHelper = "";
  @observable hitokoto: Hitokoto = { content: "", from: "" };
  // empty array: not loaded yet; null: loading; undefined: error occurred;
  @observable news: NewItem[] | null | undefined = [];
  againRequestingPassword = false;
  canceller = new Canceller();
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
        canceller: this.canceller,
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
          } else if (stat === "microsoftTokenUnavailable" && cb) {
            showOverlay({
              title: t("warning"),
              message: t("unableToRefreshMsToken"),
              positiveText: t("continueAnyway"),
              dangerous: true,
              cancellable: () => this.setLaunching(false),
              fineCancel: true,
              action: cb,
            });
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
    this.canceller.cancel() && this.setLaunching(false);
  };
}

export const homePageStore = new HomePageStore();

function MetroCardProvider(props: {
  value: boolean;
  children: ReactNode;
  placement: FnBoardPlacement;
}): JSX.Element {
  return props.value ? (
    props.placement === "top" ? (
      <div className="p-6 flex justify-center space-x-2 slideInDown">
        <MetroCardContext.Provider value={configStore.enableBg}>
          {props.children}
        </MetroCardContext.Provider>
      </div>
    ) : props.placement === "right" ? (
      <div className="flex h-full justify-end">
        <div className="flex flex-col justify-center space-y-2 mr-3 slideInRight">
          <MetroCardContext.Provider value={configStore.enableBg}>
            {props.children}
          </MetroCardContext.Provider>
        </div>
      </div>
    ) : (
      <div></div>
    )
  ) : (
    <div className="grid grid-cols-2 gap-5 p-6">
      <MetroCardContext.Provider value={false}>
        {props.children}
      </MetroCardContext.Provider>
    </div>
  );
}

const HomePage = observer(() => {
  const account = useMemo(() => _.selected(configStore.accounts), []);
  const profiles = configStore.profiles;
  const [value, setValue] = useState<number | null>(
    _.selectedIndex(configStore.profiles) ?? null
  );
  const profile = value !== null && configStore.profiles[+value];

  const handleChange = (val: number) => {
    setValue(val);
    setConfig(() => _.selectByIndex(profiles, val));
  };

  useEffect(() => {
    if (configStore.hitokoto && !homePageStore.hitokoto.content) {
      homePageStore.reloadHitokoto();
    }
    if (configStore.news && homePageStore.news?.length === 0) {
      homePageStore.reloadNews();
    }
  }, []);

  return (
    <div
      style={
        configStore.enableBg
          ? {
              backgroundImage: `url(resource://${encodeURI(
                configStore.bgPath
              )})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
          : {}
      }
      className="eph-h-full flex"
    >
      <div
        style={{
          backdropFilter: "blur(10px)",
        }}
        className={`bg-gray-200 dark:bg-slate-700 bg-opacity-70 dark:bg-opacity-70 w-1/3 p-6 flex flex-col overflow-auto ${
          configStore.enableBg && "slideInLeft"
        }`}
      >
        <div className="flex-grow">
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {t("hello")}
          </p>
          <p className="text-2xl font-medium">
            {account?.name ?? t("account.notSelected")}
          </p>
          {configStore.hitokoto && (
            <>
              <div className="eph-force-zh-cn">
                <p className="text-sm">{homePageStore.hitokoto.content}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {homePageStore.hitokoto.from}
                </p>
              </div>
              <div className="flex justify-end">
                <IconButton
                  className="w-7 h-7"
                  onClick={homePageStore.reloadHitokoto}
                >
                  <MdRefresh />
                </IconButton>
              </div>
            </>
          )}
        </div>
        <div className="flex-grow">
          {configStore.news && (
            <div>
              <p className="text-2xl font-semibold text-center">{t("news")}</p>
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
                <div className="eph-force-zh-cn">
                  {homePageStore.news
                    .slice(0, configStore.newsTitleAmount)
                    .map((val, index) => (
                      <p
                        key={index}
                        dangerouslySetInnerHTML={{ __html: val.title }}
                      />
                    ))}
                </div>
              )}
              <div className="flex justify-end p-1 space-x-3 items-center">
                <IconButton
                  className="w-7 h-7"
                  onClick={homePageStore.reloadNews}
                >
                  <MdRefresh />
                </IconButton>
                <IconButton
                  className="w-7 h-7"
                  onClick={() =>
                    showOverlay({
                      type: "sheet",
                      title: t("news"),
                      content: NewsView,
                    })
                  }
                >
                  <MdMoreVert />
                </IconButton>
              </div>
            </div>
          )}
        </div>
        <div className="text-contrast flex items-center">
          <BadgeButton
            className="whitespace-nowrap"
            onClick={() =>
              showOverlay({
                type: "sheet",
                title: t("java.manage"),
                content: JavaManagementSheet,
              })
            }
          >
            {t("java.manage")}
          </BadgeButton>
          <div className="flex-grow" />
          <p className="text-sm">
            Java:{" "}
            {apply(
              (profile
                ? configStore.javas.find((j) => j.nanoid === profile.java)
                : undefined) ?? _.selected(configStore.javas),
              (j) =>
                j.nickname ? (
                  <>
                    {j.nickname} ({j.name})
                  </>
                ) : (
                  j.name
                )
            ) ?? t("haveNot")}
          </p>
        </div>
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex-grow">
          <MetroCardProvider
            value={configStore.enableBg}
            placement={configStore.fnBoardPlacement}
          >
            <MetroCard
              className="bg-orange-400"
              icon={<MdAccountCircle />}
              target="accounts"
            />
            <MetroCard
              className="bg-green-600"
              icon={<MdGamepad />}
              target="profiles"
            />
            <MetroCard
              className="bg-violet-700"
              icon={<MdViewCarousel />}
              target="processes"
            />
            <MetroCard
              className="bg-sky-400"
              icon={<MdApps />}
              target="extensions"
            />
            <MetroCard
              className="bg-teal-600"
              icon={<BsServer />}
              target="serverControl"
            />
            <MetroCard
              className="bg-slate-700"
              icon={<MdSettings />}
              target="settings"
            />
          </MetroCardProvider>
        </div>
        {profile && value !== null ? (
          <div>
            {homePageStore.isLaunching && (
              <ShadowText>{homePageStore.launchingHelper}</ShadowText>
            )}
            <div className="flex items-center justify-end mx-3 mb-3">
              <Select
                value={value}
                options={_.map(profiles, (i, id) => ({
                  value: id,
                  text: i.name,
                }))}
                onChange={handleChange}
                disabled={homePageStore.isLaunching}
                className="overflow-ellipsis"
                placementTop
              />
              {homePageStore.isLaunching ? (
                <Button
                  onClick={homePageStore.cancel}
                  variant="contained"
                  className="whitespace-nowrap"
                >
                  {t("cancel")}
                </Button>
              ) : (
                <Button
                  onClick={() => homePageStore.launch(account, profile)}
                  variant="contained"
                  className="whitespace-nowrap"
                >
                  {t("launch")}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <ShadowText>{t("profile.notSelected")}</ShadowText>
        )}
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
      action: () => historyStore.push("java.installJava"),
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
      action: () => historyStore.push("java.installJava"),
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
    action: () => historyStore.push("java.installJava"),
    bottomDivide: true,
  });
}

export default HomePage;
