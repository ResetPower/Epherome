import {
  Button,
  IconButton,
  TextField,
  BadgeButton,
  Hyperlink,
} from "@resetpower/rcs";
import { useEffect, useMemo } from "react";
import { configStore } from "common/struct/config";
import {
  MdAccountCircle,
  MdApps,
  MdBugReport,
  MdGamepad,
  MdRefresh,
  MdSettings,
  MdStore,
  MdViewCarousel,
  MdViewDay,
} from "react-icons/md";
import { IoRefresh } from "react-icons/io5";
import { showOverlay } from "../../overlay";
import { t } from "../../intl";
import { _ } from "common/utils/arrays";
import { observer } from "mobx-react-lite";
import NewsView from "../NewsView";
import JavaManagementSheet from "../settings/JavaManagementSheet";
import { historyStore } from "eph/renderer/history";
import { apply } from "common/utils";
import { BsServer } from "react-icons/bs";
import { openInBrowser } from "common/utils/open";
import { homePageStore } from "./store";
import { MetroCardProvider, MetroCard } from "eph/components/MetroCard";
import SlightText from "eph/components/SlightText";

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

const HomePage = observer(() => {
  const account = useMemo(() => _.selected(configStore.accounts), []);
  const profile = configStore.currentProfile;

  useEffect(() => {
    if (configStore.hitokoto && !homePageStore.hitokoto.content) {
      homePageStore.reloadHitokoto();
    }
    if (configStore.news && homePageStore.news?.length === 0) {
      homePageStore.reloadNews();
    }
  }, []);

  const onEnterNews = () =>
    showOverlay({
      type: "sheet",
      title: t("news"),
      content: NewsView,
    });

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
        className={`bg-gray-200 dark:bg-slate-700 bg-opacity-70 dark:bg-opacity-70 w-1/3 p-6 flex flex-col overflow-y-auto ${
          configStore.enableBg && "slideInLeft"
        }`}
      >
        <div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            {t("hello")}
          </p>
          <SlightText
            className="text-2xl font-medium"
            onClick={() => historyStore.push("accounts")}
          >
            {account?.name ?? t("account.notSelected")}
          </SlightText>
          {configStore.hitokoto && (
            <>
              <div>
                <p className="text-sm">{homePageStore.hitokoto.content}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {homePageStore.hitokoto.from}
                </p>
              </div>
              {configStore.hitokotoRefreshButton ? (
                <div className="flex justify-end">
                  <IconButton
                    className="w-7 h-7"
                    onClick={homePageStore.reloadHitokoto}
                  >
                    <MdRefresh />
                  </IconButton>
                </div>
              ) : (
                <div className="h-3" />
              )}
            </>
          )}
        </div>
        <div>
          {configStore.news && (
            <div className="mt-6">
              <div className="flex items-center">
                <div className="text-2xl font-medium flex-grow">
                  {t("news")}
                </div>
                <IconButton onClick={onEnterNews}>
                  <MdViewDay />
                </IconButton>
                <IconButton onClick={homePageStore.reloadNews}>
                  <IoRefresh />
                </IconButton>
              </div>
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
                <div>
                  {homePageStore.news
                    .slice(0, configStore.newsTitleAmount)
                    .map((val, index) => (
                      <p key={index}>{val.title}</p>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-grow" />
        {homePageStore.isLaunching && (
          <div className="flex-col items-center p-3">
            <p className="text-lg font-semibold">Launching...</p>
            <p className="text-sm">{homePageStore.launchingHelper}</p>
          </div>
        )}
        {profile ? (
          <div className="flex items-center space-x-3 mb-3">
            <div
              className="flex-grow cursor-pointer select-none"
              onClick={() => historyStore.push("profiles")}
            >
              <SlightText>{profile.name}</SlightText>
              {profile.from === "folder" && profile.parent && (
                <div className="text-sm text-shallow">
                  {profile.parent.nickname}
                </div>
              )}
            </div>
            {homePageStore.isLaunching ? (
              <Button
                onClick={homePageStore.cancel}
                variant="pill"
                className="whitespace-nowrap bg-red-400 hover:bg-red-500 active:bg-red-600"
              >
                {t("cancel")}
              </Button>
            ) : (
              <Button
                onClick={() => homePageStore.launch(account, profile)}
                variant="pill"
                className="whitespace-nowrap"
              >
                {t("launch")}
              </Button>
            )}
          </div>
        ) : (
          <div>
            <SlightText
              className="flex-grow"
              onClick={() => historyStore.push("profiles")}
            >
              {t("profile.notSelected")}
            </SlightText>
          </div>
        )}
        <div className="flex">
          <Button
            className="flex-grow text-center"
            onClick={() => historyStore.push("marketplace")}
          >
            <MdStore /> {t("marketplace")}
          </Button>
          <Button
            className="flex-grow text-center"
            onClick={() =>
              showOverlay({
                content: () => (
                  <div>
                    Please move to{" "}
                    <Hyperlink
                      onClick={() =>
                        openInBrowser(
                          "https://github.com/ResetPower/Epherome/issues"
                        )
                      }
                    >
                      GitHub Issues
                    </Hyperlink>
                    .
                  </div>
                ),
              })
            }
          >
            <MdBugReport /> {t("bugReport")}
          </Button>
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
      </div>
    </div>
  );
});

export default HomePage;
