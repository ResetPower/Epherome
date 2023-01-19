import {
  Button,
  Center,
  Info,
  ListItem,
  TabBar,
  TabBarItem,
  TabBody,
  TabContext,
  TabController,
} from "@resetpower/rcs";
import { MinecraftServer } from "common/struct/server";
import { DefaultFn } from "common/utils";
import { t } from "eph/intl";
import { MutableRefObject, ReactNode } from "react";
import { MdRefresh, MdRemoveCircle } from "react-icons/md";
import { JavaStatusResponse, status } from "minecraft-server-util";
import { Card } from "eph/components/layouts";
import { ServerResponseStore } from "./ServerControlPage";
import { useReducer } from "react";
import { useEffect } from "react";
import { Avatar } from "eph/components/skin";

function Dot(props: {
  variant: "connecting" | "online" | "offline";
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex items-center space-x-3">
      <div
        className={`w-3 h-3 rounded-full ${
          props.variant === "connecting"
            ? "bg-blue-500"
            : props.variant === "online"
            ? "bg-green-500"
            : "bg-red-500"
        }`}
      ></div>
      <p>{props.children}</p>
    </div>
  );
}

function PlayerList(props: { state: JavaStatusResponse }): JSX.Element {
  const state = props.state;
  const list =
    state.players?.sample?.map((value, index) => (
      <ListItem key={index}>
        <Avatar uuid={value.id} />
        <p className="ml-3">{value.name}</p>
      </ListItem>
    )) ?? [];
  return (
    <div className="h-full">
      {list.length === 0 ? (
        state.players?.online === 0 ? (
          <Center className="text-shallow">{t("noPlayersOnline")}</Center>
        ) : (
          <Center className="text-shallow">
            {t("unableToShowTooManyPlayers")}
          </Center>
        )
      ) : (
        list
      )}
    </div>
  );
}

export default function ServerManagerFragment(props: {
  server: MinecraftServer;
  store: ServerResponseStore;
  onRemove: DefaultFn;
  tabRef: MutableRefObject<TabContext | undefined>;
}): JSX.Element {
  const [state, dispatch] = useReducer(
    () => props.store.get(props.server.ip),
    props.store.get(props.server.ip)
  );

  const onRefresh = () => {
    props.store.put(props.server.ip, undefined);
    dispatch();
    status(props.server.ip, undefined, { enableSRV: false })
      .then((resp) => {
        props.store.put(props.server.ip, resp);
        dispatch();
      })
      .catch(() => {
        props.store.put(props.server.ip, null);
        dispatch();
      });
  };

  useEffect(() => {
    if (state === undefined) onRefresh();
  });

  useEffect(dispatch, [props.server, dispatch]);

  return (
    <TabController
      contextRef={props.tabRef}
      className="h-full"
      orientation="horizontal"
    >
      <TabBar>
        <TabBarItem value={0}>{t("general")}</TabBarItem>
        <TabBarItem value={1}>Players</TabBarItem>
      </TabBar>
      <TabBody>
        <div className="h-full flex flex-col">
          <Info title={t("name")}>{props.server.name}</Info>
          <Info title="IP">{props.server.ip}</Info>
          <Info title={t("status")}>
            {state === undefined ? (
              <Dot variant="connecting">{t("connecting")}</Dot>
            ) : state === null ? (
              <Dot variant="offline">{t("offline")}</Dot>
            ) : (
              <>
                <Dot variant="online">{t("online")}</Dot>
                <Info title="Players">
                  {state.players.online}/{state.players.max}
                </Info>
                <Info title={t("version")}>{state.version.name}</Info>
              </>
            )}
          </Info>
          <div className="flex-grow" />
          <Card
            className="bg-stone-800 bg-opacity-75 dark:bg-opacity-100"
            variant="contained"
          >
            {state && (
              <div className="flex items-center space-x-3">
                <img
                  className="w-12 rounded-md"
                  alt=""
                  src={state.favicon ?? undefined}
                />
                <p
                  className="text-lg"
                  dangerouslySetInnerHTML={{
                    __html: state.motd.html.replace("\n", "<br/>"),
                  }}
                ></p>
              </div>
            )}
            <div className="flex justify-end">
              <Button
                className="text-white"
                disabled={state === undefined}
                onClick={onRefresh}
              >
                <MdRefresh /> {t("refresh")}
              </Button>
              <Button onClick={props.onRemove} className="text-red-400">
                <MdRemoveCircle /> {t("remove")}
              </Button>
            </div>
          </Card>
        </div>
        {state ? (
          <PlayerList state={state} />
        ) : (
          <Center className="text-shallow">{t("serverIsOffline")}</Center>
        )}
      </TabBody>
    </TabController>
  );
}
