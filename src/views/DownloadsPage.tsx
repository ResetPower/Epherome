import { Button, Checkbox, TextField } from "../components/inputs";
import { MinecraftVersion, MinecraftVersionType } from "../craft/versions";
import { logger } from "../renderer/global";
import Spin from "../components/Spin";
import got from "got";
import { Alert, Typography } from "../components/layouts";
import { List, ListItem, ListItemText } from "../components/lists";
import { useState, useEffect, Fragment } from "react";
import { minecraftDownloadPath } from "../struct/config";
import { createProfile } from "../struct/profiles";
import { t } from "../intl";
import { MdGamepad } from "react-icons/md";
import ProgressBar from "../components/ProgressBar";
import { useRef } from "react";
import { downloadMinecraft } from "../craft/download";
import { MinecraftUrls } from "../craft/url";
import { Downloader, DownloaderTask } from "../models/downloader";

export function DownloadingFragment(props: {
  version: MinecraftVersion;
  locking: boolean;
  setLocking: (locking: boolean) => void;
}): JSX.Element {
  const downloader = useRef<Downloader>();
  const [status, setStatus] = useState<null | "error" | "done">(null);
  const [tasks, setTasks] = useState<DownloaderTask[]>([]);
  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [name, setName] = useState(`Minecraft ${props.version.id}`);

  useEffect(() => {
    // update text field on props change
    setName(`Minecraft ${props.version.id}`);
    setStatus(null);
  }, [props.version.id]);

  const onError = (error: Error) => {
    setStatus("error");
    props.setLocking(false);
    throw error;
  };

  const handleCancel = () => {
    logger.info("Download cancelled");
    downloader.current?.cancel();
    setStatus(null);
    props.setLocking(false);
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
        });
        setStatus("done");
        props.setLocking(false);
      }
    ).then((result) => {
      downloader.current = result;
      result.start();
    });
  };

  return (
    <div className="p-16 h-full flex flex-col">
      <Typography className="font-semibold text-xl py-3">
        {t("download")} Minecraft {props.version.id}
      </Typography>
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
        {status === "done" && <Typography>{t("done")}</Typography>}
        {props.locking && tasks.length === 0 && (
          <Typography>{t("download.preparing")}</Typography>
        )}
        {props.locking &&
          tasks.map((val, index) => (
            <Fragment key={index}>
              <div className="flex text-sm">
                <Typography className="flex-grow">
                  {t("downloadingSomething", val.filename)}
                </Typography>
                {val.error && (
                  <p className="text-red-500">{t("errorOccurred")}</p>
                )}
                {!val.error && (
                  <p className="text-shallow">({val.percentage}%)</p>
                )}
              </div>
              <ProgressBar percentage={val.percentage} />
            </Fragment>
          ))}
      </div>
      <div className="flex items-center">
        {props.locking && <p className="text-shallow">{totalPercentage}%</p>}
        <div className="flex-grow" />
        {props.locking && <Button onClick={handleCancel}>{t("cancel")}</Button>}
        <Button
          variant="contained"
          disabled={props.locking || status === "done"}
          onClick={handleStart}
        >
          {t("download")}
        </Button>
      </div>
    </div>
  );
}

export default function DownloadsPage(): JSX.Element {
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
    logger.info("Fetching Minecraft launcher meta...");
    got(MinecraftUrls.versionManifest)
      .then((resp) => {
        const parsed = JSON.parse(resp.body);
        setVersions(parsed.versions);
        logger.info("Fetched Minecraft launcher meta");
      })
      .catch(() => {
        logger.warn("Unable to fetch Minecraft launcher meta");
        setVersions(null);
      });
    return () => {
      // destroy downloads
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
            version={current}
            locking={locking}
            setLocking={setLocking}
          />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
