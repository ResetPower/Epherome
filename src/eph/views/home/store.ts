import { MinecraftAccount } from "common/struct/accounts";
import { configStore } from "common/struct/config";
import { fetchHitokoto, Hitokoto } from "common/struct/hitokoto";
import { fetchNews, NewItem } from "common/struct/news";
import { MinecraftProfile } from "common/struct/profiles";
import { Canceller } from "common/task/cancel";
import { randomNumberInClosedInterval } from "common/utils";
import { _ } from "common/utils/arrays";
import { ObjectWrapper } from "common/utils/object";
import { launchMinecraft } from "core/launch";
import { t } from "eph/intl";
import { showOverlay } from "eph/overlay";
import { action, makeObservable, observable, runInAction } from "mobx";
import {
  showJava16RequiredDialog,
  showJava17RequiredDialog,
  showJava8RequiredDialog,
  showNoJavaDialog,
} from "./dialogs";
import { RequestPasswordDialog } from "./HomePage";

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
    if (configStore.hitokoto === "custom") {
      this.hitokoto =
        configStore.customHitokotoList[
          randomNumberInClosedInterval(
            0,
            configStore.customHitokotoList.length - 1
          )
        ];
    } else {
      this.hitokoto = { content: "...", from: "..." };
      fetchHitokoto().then((hk) =>
        runInAction(() => {
          this.hitokoto = hk ?? {
            content: t("internetNotAvailable"),
            from: "",
          };
        })
      );
    }
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
