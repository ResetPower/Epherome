import {
  Button,
  Checkbox,
  TextField,
  Spin,
  List,
  ListItem,
  ListItemText,
  ProgressBar,
  Center,
} from "@resetpower/rcs";
import { MinecraftVersion, MinecraftVersionType } from "core/launch/versions";
import { rendererLogger } from "common/loggers";
import { Alert } from "../components/layouts";
import { useState, useEffect, Fragment, useRef, useReducer } from "react";
import { createProfile } from "../../common/struct/profiles";
import { t } from "../intl";
import { MdClose, MdFileDownload, MdGamepad } from "react-icons/md";
import { downloadMinecraft } from "core/installer/minecraft";
import { MinecraftUrlUtil } from "core/url";
import { defaultJvmArgs } from "common/struct/java";
import { showOverlay } from "eph/overlay";
import got from "got";
import { ephDefaultDotMinecraft } from "common/utils/info";
import { taskStore } from "common/task/store";
import { pushToHistory } from "eph/renderer/history";
import { adapt } from "common/utils";
import { Task } from "common/task";
import { observer } from "mobx-react-lite";

export function DownloadingFragment(props: {
  version: MinecraftVersion;
  task?: Task;
}): JSX.Element {
  const task = useRef(props.task);
  const running = task.current?.isRunning;
  const percentage = task.current?.percentage;

  const [, update] = useReducer((x) => x + 1, 0);
  const [name, setName] = useState(
    task.current?.hashMap.get("profileName") ?? `Minecraft ${props.version.id}`
  );

  task.current && (task.current.onSignal = update);

  useEffect(() => {
    // update text field on props change
    !running && setName(`Minecraft ${props.version.id}`);
  }, [props.version.id, running]);

  const onError = (error: Error) => {
    task.current && task.current.err(error);
    update();
  };

  const handleCancel = () => {
    if (task.current) {
      task.current.cancel() && taskStore.finish(task);
      update();
    }
  };

  const handleStart = () => {
    // register task
    const params = JSON.stringify(props.version);
    task.current = taskStore.register(
      `Download Minecraft ${props.version.id}`,
      "installMinecraft",
      { version: params, profileName: name },
      () => pushToHistory("download", params)
    );
    downloadMinecraft(props.version, task.current)
      .then(() => {
        createProfile({
          name,
          dir: ephDefaultDotMinecraft,
          ver: props.version.id,
          from: "download",
          jvmArgs: defaultJvmArgs(),
        });
        showOverlay({
          message: t("doneMessage"),
          action: () => history.back(),
        });
      })
      .catch(onError);
    update();
  };

  return (
    <div className="p-9 h-full flex flex-col">
      <p className="font-semibold text-xl py-3">
        {t("download")} Minecraft {props.version.id}
      </p>
      <TextField
        icon={<MdGamepad />}
        label={t("download.profileName")}
        value={name}
        onChange={setName}
        disabled={running}
        placeholder={t("name")}
      />
      <div className="flex-grow py-3">
        {percentage === -2 && (
          <Alert severity="error">{t("errorOccurred")}</Alert>
        )}
        {percentage === 100 && <p>{t("done")}</p>}
        {percentage === -1 && <p>{t("download.preparing")}</p>}
        {running &&
          task.current?.subTasks.map(
            (val, index) =>
              val.inProgress && (
                <Fragment key={index}>
                  <div className="flex text-sm">
                    <p className="flex-grow">
                      {t("downloadingSomething", val.name)}
                    </p>
                    <p className="text-shallow">{val.percentage}%</p>
                  </div>
                  <ProgressBar percentage={val.percentage} />
                </Fragment>
              )
          )}
      </div>
      <div className="flex items-center">
        {running && <p className="text-shallow">{percentage}%</p>}
        <div className="flex-grow" />
        {running || percentage === -1 ? (
          <Button onClick={handleCancel}>
            <MdClose /> {t("cancel")}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleStart}>
            <MdFileDownload /> {t("download")}
          </Button>
        )}
      </div>
    </div>
  );
}

const DownloadsPage = observer(
  (props: { version?: MinecraftVersion }): JSX.Element => {
    console.log("FUCKU!");
    // load the download task last time
    let version = props.version;
    const task = taskStore.findByType("installMinecraft");
    if (task) {
      const ver = task.hashMap.get("version");
      ver && (version = JSON.parse(ver));
    }

    const [release, setRelease] = useState(true);
    const [snapshot, setSnapshot] = useState(
      false || version?.type === "snapshot"
    );
    const [old, setOld] = useState(
      false || adapt(version?.type, "old_alpha", "old_beta")
    );
    const [selected, setSelected] = useState(-1);
    const [versions, setVersions] = useState<
      MinecraftVersion[] | null | undefined
    >(undefined);
    const current = (versions ?? [])[selected];

    const matchType = (type: MinecraftVersionType) =>
      type === "release"
        ? release
        : type === "snapshot"
        ? snapshot
        : type === "old_beta" || type === "old_alpha"
        ? old
        : false;

    useEffect(() => {
      const urlUtil = MinecraftUrlUtil.fromDefault();
      // copy the ref here in order to satisfy eslint-plugin-react-hooks
      rendererLogger.info("Fetching Minecraft launcher meta...");
      got
        .get(urlUtil.versionManifest())
        .then((resp) => {
          const parsed = JSON.parse(resp.body);
          setVersions(parsed.versions);
          rendererLogger.info("Fetched Minecraft launcher meta");
        })
        .catch(() => {
          rendererLogger.warn("Unable to fetch Minecraft launcher meta");
          setVersions(null);
        });
    }, []);

    return (
      <div className="flex eph-h-full">
        <div className="p-3 bg-card shadow-md overflow-y-auto w-1/4">
          <div className="p-3">
            <Checkbox checked={release} onChange={setRelease}>
              {t("version.release")}
            </Checkbox>
            <Checkbox checked={snapshot} onChange={setSnapshot}>
              {t("version.snapshot")}
            </Checkbox>
            <Checkbox checked={old} onChange={setOld}>
              {t("version.old")}
            </Checkbox>
          </div>
          {versions ? (
            <List>
              {versions.map(
                (item, index) =>
                  matchType(item.type) && (
                    <ListItem
                      className="rounded-lg p-1 pl-3"
                      checked={selected === index}
                      onClick={() =>
                        selected === index
                          ? setSelected(-1)
                          : setSelected(index)
                      }
                      key={index}
                    >
                      <ListItemText
                        primary={item.id}
                        secondary={t(`version.${item.type}`)}
                        className="cursor-pointer"
                      />
                    </ListItem>
                  )
              )}
            </List>
          ) : versions === undefined ? (
            <div className="p-3">
              <Spin />
            </div>
          ) : (
            <p className="text-shallow">{t("internetNotAvailable")}</p>
          )}
        </div>
        <div className="w-3/4">
          {current || version ? (
            <DownloadingFragment
              version={current ?? version}
              task={task ?? undefined}
            />
          ) : (
            <Center>
              <p className="text-shallow">{t("download.notSelected")}</p>
            </Center>
          )}
        </div>
      </div>
    );
  }
);

export default DownloadsPage;
