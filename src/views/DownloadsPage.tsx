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
import { useState, useEffect } from "react";
import { downloadFile } from "../core/net/download";
import { minecraftDownloadPath } from "../struct/config";
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
  const startDownload = async () => {
    setStep(t("downloadingSomething", "Json"));
    const jsonPath = path.join(
      minecraftDownloadPath,
      "versions",
      props.version.id,
      `${props.version.id}.json`
    );
    await downloadFile(props.version.url, jsonPath, true);

    setStep(t("downloadingSomething", "Jar"));
    const jarPath = path.join(
      minecraftDownloadPath,
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
      dir: minecraftDownloadPath,
      ver: props.version.id,
      from: "download",
    });
  };

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
  const [versions, setVersions] = useState<MinecraftVersion[] | null>(null);
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
  }, []);

  return (
    <Container className="p-3 eph-h-full overflow-y-auto">
      <div className="flex space-x-3">
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
