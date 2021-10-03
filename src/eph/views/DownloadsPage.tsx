import { Button, Checkbox, TextField } from "../components/inputs";
import { MinecraftVersion, MinecraftVersionType } from "core/launch/versions";
import { rendererLogger } from "common/loggers";
import Spin from "../components/Spin";
import { Alert } from "../components/layouts";
import { List, ListItem, ListItemText } from "../components/lists";
import { useState, useEffect, useRef, Fragment } from "react";
import { minecraftDownloadPath } from "common/struct/config";
import { createProfile } from "common/struct/profiles";
import { t } from "../intl";
import { MdClose, MdFileDownload, MdGamepad } from "react-icons/md";
import ProgressBar from "../components/ProgressBar";
import { downloadMinecraft } from "core/installer/minecraft";
import { MinecraftUrlUtils } from "core/down/url";
import { call, DefaultFn } from "common/utils";
import { ObjectWrapper } from "common/utils/object";
import { defaultJvmArgs } from "core/java";
import { Center } from "../components/fragments";
import { showOverlay } from "eph/renderer/overlays";
import { DoneDialog } from "eph/components/Dialog";
import { historyStore } from "eph/renderer/history";
import { DownloadDetail } from "core/down/downloader";

export function DownloadingFragment(props: {
  version: MinecraftVersion;
  locking: boolean;
  canceller: ObjectWrapper<DefaultFn>;
  setLocking: (locking: boolean) => void;
}): JSX.Element {
  const canceller = useRef<DefaultFn>();
  const [status, setStatus] = useState<null | "error" | "done">(null);
  const [tasks, setTasks] = useState<ObjectWrapper<DownloadDetail[]>>(
    new ObjectWrapper([])
  );
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [name, setName] = useState(`Minecraft ${props.version.id}`);

  useEffect(() => {
    // update text field on props change
    setName(`Minecraft ${props.version.id}`);
    setStatus(null);
  }, [props.version.id]);

  const onError = (error: Error) => {
    props.setLocking(false);
    setStatus("error");
    throw error;
  };

  const handleCancel = () => {
    rendererLogger.info("Download cancelled");
    call(canceller.current);
    props.setLocking(false);
    setStatus(null);
  };

  const handleStart = () => {
    props.setLocking(true);
    downloadMinecraft(
      props.version,
      (tasks, totalPercentage) => {
        setTasks(tasks);
        setTotalPercentage(totalPercentage);
      },
      onError,
      () => {
        createProfile({
          name,
          dir: minecraftDownloadPath,
          ver: props.version.id,
          from: "download",
          jvmArgs: defaultJvmArgs(),
        });
        setStatus("done");
        props.setLocking(false);
        showOverlay(<DoneDialog back={historyStore.back} />);
      },
      canceller
    );
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
        onChange={!props.locking ? setName : undefined}
        placeholder={t("name")}
      />
      <div className="flex-grow py-3">
        {status === "error" && (
          <Alert severity="error">{t("errorOccurred")}</Alert>
        )}
        {status === "done" && <p>{t("done")}</p>}
        {props.locking && tasks.current.length === 0 && (
          <p>{t("download.preparing")}</p>
        )}
        {props.locking &&
          tasks.current.map(
            (val, index) =>
              val.inProgress && (
                <Fragment key={index}>
                  <div className="flex text-sm">
                    <p className="flex-grow">
                      {t("downloadingSomething", val.filename)}
                    </p>
                    <p className="text-shallow">({val.percentage}%)</p>
                  </div>
                  <ProgressBar percentage={val.percentage} />
                </Fragment>
              )
          )}
      </div>
      <div className="flex items-center">
        {props.locking && <p className="text-shallow">{totalPercentage}%</p>}
        <div className="flex-grow" />
        {props.locking ? (
          <Button onClick={handleCancel}>
            <MdClose /> {t("cancel")}
          </Button>
        ) : (
          status !== "done" && (
            <Button variant="contained" onClick={handleStart}>
              <MdFileDownload /> {t("download")}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export default function DownloadsPage(): JSX.Element {
  const canceller = useRef<ObjectWrapper<DefaultFn>>(
    new ObjectWrapper<DefaultFn>(() => {
      /**/
    })
  );
  const [locking, setLocking] = useState(false);
  const [release, setRelease] = useState(true);
  const [snapshot, setSnapshot] = useState(false);
  const [old, setOld] = useState(false);
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
    // copy the ref here in order to satisfy eslint-plugin-react-hooks
    const cancellerRef = canceller;

    rendererLogger.info("Fetching Minecraft launcher meta...");
    window.native.request(
      "get",
      MinecraftUrlUtils.versionManifest(),
      (err, data) => {
        if (err || !data) {
          rendererLogger.warn("Unable to fetch Minecraft launcher meta");
          setVersions(null);
        } else {
          const [_, body] = data;
          const parsed = JSON.parse(body);
          setVersions(parsed.versions);
          rendererLogger.info("Fetched Minecraft launcher meta");
        }
      }
    );
    return () => {
      call(cancellerRef.current?.current);
    };
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
                      !locking &&
                      (selected === index
                        ? setSelected(-1)
                        : setSelected(index))
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
        {current ? (
          <DownloadingFragment
            canceller={canceller.current}
            version={current}
            locking={locking}
            setLocking={setLocking}
          />
        ) : (
          <Center hFull>
            <p className="text-shallow">{t("download.notSelected")}</p>
          </Center>
        )}
      </div>
    </div>
  );
}
