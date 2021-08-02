import { DefaultFn } from "../tools";
import { Button, Checkbox } from "../components/inputs";
import { MinecraftVersion, MinecraftVersionType } from "../core/versions";
import { logger } from "../renderer/global";
import Spin from "../components/Spin";
import got from "got";
import { Container, Typography } from "../components/layouts";
import { List, ListItem, ListItemText } from "../components/lists";
import { showDialog } from "../renderer/overlays";
import Dialog from "../components/Dialog";
import { useCallback, useState, useEffect } from "react";
import { downloadFile } from "../core/net/download";
import { mcDownloadPath } from "../struct/config";
import path from "path";
import fs from "fs";
import { ClientJson } from "../core/struct";
import { unwrapFunction } from "../tools";
import { createProfile } from "../struct/profiles";
import { t } from "../intl";

export function DownloadDialog(props: {
  version: MinecraftVersion;
  onClose: DefaultFn;
}): JSX.Element {
  const [step, setStep] = useState<string | null>(null);
  const startDownload = useCallback(async () => {
    setStep(t("downloadingJson"));
    const jsonPath = path.join(
      mcDownloadPath,
      "versions",
      props.version.id,
      `${props.version.id}.json`
    );
    await downloadFile(props.version.url, jsonPath, true);

    setStep(t("downloadingJar"));
    const jarPath = path.join(
      mcDownloadPath,
      "versions",
      props.version.id,
      `${props.version.id}.jar`
    );
    const parsed: ClientJson = JSON.parse(fs.readFileSync(jsonPath).toString());
    await downloadFile(parsed.downloads.client.url, jarPath, true);

    // props.onClose is sure to be non-null and we don't need to call unwrapFunction here
    // but eslint-plugin-react-hooks doesn't think so
    unwrapFunction(props.onClose)();

    createProfile({
      name: `Minecraft ${props.version.id}`,
      dir: mcDownloadPath,
      ver: props.version.id,
      from: "download",
    });
  }, [props.version, props.onClose]);

  return (
    <Dialog indentBottom>
      <Typography className="font-semibold text-lg">
        {t("download")} Minecraft {props.version.id}
      </Typography>
      <div>
        <Typography>{step}</Typography>
      </div>
      <div className="flex">
        {step === null && (
          <Button onClick={startDownload}>{t("download")}</Button>
        )}
        <div className="flex-grow" />
        <Button onClick={props.onClose}>{t("cancel")}</Button>
      </div>
    </Dialog>
  );
}

export default function DownloadsPage(): JSX.Element {
  const [release, setRelease] = useState(true);
  const [snapshot, setSnapshot] = useState(false);
  const [old, setOld] = useState(false);
  const [versions, setVersions] = useState<MinecraftVersion[]>([]);
  const matchType = useCallback(
    (type: MinecraftVersionType) =>
      type === "release"
        ? release
        : type === "snapshot"
        ? snapshot
        : type === "old_beta" || type === "old_alpha"
        ? old
        : false,
    [release, snapshot, old]
  );

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
  }, []);

  return (
    <Container className="p-3 eph-h-full overflow-y-auto">
      <div className="flex space-x-3">
        <Checkbox checked={release} onChange={setRelease}>
          {t("release")}
        </Checkbox>
        <Checkbox checked={snapshot} onChange={setSnapshot}>
          {t("snapshot")}
        </Checkbox>
        <Checkbox checked={old} onChange={setOld}>
          {t("old")}
        </Checkbox>
      </div>
      {versions ? (
        <List>
          {versions.map(
            (item, index) =>
              matchType(item.type) && (
                <ListItem
                  className="rounded-lg p-2"
                  onClick={() =>
                    showDialog((close) => (
                      <DownloadDialog version={item} onClose={close} />
                    ))
                  }
                  key={index}
                >
                  <ListItemText
                    primary={item.id}
                    secondary={item.type}
                    className="cursor-pointer"
                  />
                </ListItem>
              )
          )}
        </List>
      ) : (
        <div className="flex justify-center">
          <Spin />
        </div>
      )}
    </Container>
  );
}
