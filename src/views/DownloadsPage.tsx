import { Button, Checkbox, TextField } from "../components/inputs";
import { MinecraftVersion, MinecraftVersionType } from "../core/versions";
import { logger } from "../renderer/global";
import Spin from "../components/Spin";
import got from "got";
import { Alert, Typography } from "../components/layouts";
import { List, ListItem, ListItemText } from "../components/lists";
import { useState, useEffect } from "react";
import { cancellableDownloadFile } from "../core/net/download";
import { minecraftDownloadPath } from "../struct/config";
import path from "path";
import fs from "fs";
import { ClientJson } from "../core/struct";
import { createProfile } from "../struct/profiles";
import { t } from "../intl";
import { MdGamepad } from "react-icons/md";
import ProgressBar from "../components/ProgressBar";
import { useRef } from "react";
import { DefaultFn, unwrapFunction } from "../tools";

export function DownloadingFragment(props: {
  version: MinecraftVersion;
  setLocking: (locking: boolean) => void;
}): JSX.Element {
  const cancelDownload = useRef<DefaultFn | null>(null);
  const [percentage, setPercentage] = useState(0);
  // meanings of values of step ->
  // string: downloading
  // true: done, false: haven't started yet
  // null: error occurred during download
  const [step, setStep] = useState<string | boolean | null>(false);
  const [name, setName] = useState(`Minecraft ${props.version.id}`);
  const versionDir = path.join(
    minecraftDownloadPath,
    "versions",
    props.version.id
  );

  useEffect(() => {
    // update text field on props change
    if (!step) {
      setName(`Minecraft ${props.version.id}`);
    }
  }, [step, props.version]);

  const stopDownload = () => {
    unwrapFunction(cancelDownload.current)();
    fs.rmdirSync(versionDir, { recursive: true });
    setStep(false);
    props.setLocking(false);
  };

  const startDownload = async (onErr: (error: Error) => unknown) => {
    try {
      props.setLocking(true);

      const jsonFilename = `${props.version.id}.json`;
      setStep(t("downloadingSomething", jsonFilename));
      const jsonPath = path.join(versionDir, jsonFilename);
      const jsonDownloadGen = cancellableDownloadFile(
        props.version.url,
        jsonPath
      );
      cancelDownload.current = jsonDownloadGen.next().value;
      await jsonDownloadGen.next().value;

      const jarFilename = `${props.version.id}.jar`;
      setStep(t("downloadingSomething", jarFilename));
      const jarPath = path.join(
        minecraftDownloadPath,
        "versions",
        props.version.id,
        jarFilename
      );
      const parsed: ClientJson = JSON.parse(
        fs.readFileSync(jsonPath).toString()
      );
      const jarDownloadGen = cancellableDownloadFile(
        parsed.downloads.client.url,
        jarPath,
        ({ percent }) => setPercentage(Math.round(percent * 100))
      );
      cancelDownload.current = jarDownloadGen.next().value;
      await jarDownloadGen.next().value;

      createProfile({
        name: `Minecraft ${props.version.id}`,
        dir: minecraftDownloadPath,
        ver: props.version.id,
        from: "download",
      });

      setStep(true);
      props.setLocking(false);
    } catch (error) {
      onErr(error);
    }
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
        onChange={setName}
        placeholder={t("name")}
      />
      <div className="flex-grow py-3">
        {step === null && <Alert severity="error">{t("errorOccurred")}</Alert>}
        {typeof step === "string" && (
          <>
            <div className="flex">
              <Typography className="flex-grow">{step}</Typography>
              <p className="text-shallow">({percentage}%)</p>
            </div>
            <ProgressBar percentage={percentage} />
          </>
        )}
      </div>
      <div className="flex">
        {step && <Button onClick={stopDownload}>{t("cancel")}</Button>}
        <div onClick={stopDownload} className="flex-grow" />
        <Button
          variant="contained"
          disabled={!!step}
          onClick={() => startDownload(() => setStep(null))}
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
  const [versions, setVersions] = useState<MinecraftVersion[] | null>(null);
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
    got("https://launchermeta.mojang.com/mc/game/version_manifest.json").then(
      (resp) => {
        const parsed = JSON.parse(resp.body);
        if (parsed.hasOwnProperty("versions")) {
          setVersions(parsed.versions);
          logger.info("Fetched Minecraft launcher meta");
        }
      }
    );
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
        ) : (
          <div className="p-3">
            <Spin />
          </div>
        )}
      </div>
      <div className="w-3/4">
        {current ? (
          <DownloadingFragment version={current} setLocking={setLocking} />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
