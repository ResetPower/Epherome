import { Component } from "react";
import { DefaultFunction, EmptyObject } from "../tools/types";
import { Button, Checkbox } from "../components/inputs";
import { MinecraftVersion, MinecraftVersionType } from "../core/versions";
import { logger, t } from "../renderer/global";
import Spin from "../components/Spin";
import got from "got";
import { Container, Typography } from "../components/layouts";
import { List, ListItem, ListItemText } from "../components/lists";
import { showDialog } from "../components/GlobalOverlay";
import Dialog from "../components/Dialog";
import { useCallback } from "react";
import { useState } from "react";
import { downloadFile } from "../core/download";
import { mcDownloadPath } from "../renderer/config";
import path from "path";
import fs from "fs";
import { ClientJson } from "../core/struct";
import { unwrapFunction } from "../tools";
import { createProfile } from "../struct/profiles";

interface DownloadsPageState {
  release: boolean;
  snapshot: boolean;
  old: boolean;
  versions?: MinecraftVersion[];
}

export function DownloadDialog(props: {
  version: MinecraftVersion;
  onClose: DefaultFunction;
}): JSX.Element {
  const [step, setStep] = useState<string | null>(null);
  const startDownload = useCallback(async () => {
    setStep("Downloading JSON...");
    const jsonPath = path.join(
      mcDownloadPath,
      "versions",
      props.version.id,
      `${props.version.id}.json`
    );
    await downloadFile(props.version.url, jsonPath, true);

    setStep("Downloading JAR...");
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

    createProfile(`Minecraft ${props.version.id}`, mcDownloadPath, props.version.id, "download");
  }, [props.version, props.onClose]);

  return (
    <Dialog indentBottom>
      <Typography className="font-semibold text-xl">
        {t.download} Minecraft {props.version.id}
      </Typography>
      <div>
        <Typography>{step}</Typography>
      </div>
      <div className="flex">
        {step === null && <Button onClick={startDownload}>{t.download}</Button>}
        <div className="flex-grow"></div>
        <Button onClick={props.onClose}>{t.cancel}</Button>
      </div>
    </Dialog>
  );
}

export default class DownloadsPage extends Component<EmptyObject, DownloadsPageState> {
  state: DownloadsPageState = {
    release: true,
    snapshot: false,
    old: false,
  };
  matchType(type: MinecraftVersionType): boolean {
    return type === "release"
      ? this.state.release
      : type === "snapshot"
      ? this.state.snapshot
      : type === "old_beta" || type === "old_alpha"
      ? this.state.old
      : false;
  }
  componentDidMount(): void {
    logger.info("Fetching Minecraft launcher meta...");
    got("https://launchermeta.mojang.com/mc/game/version_manifest.json").then((resp) => {
      const parsed = JSON.parse(resp.body);
      if (parsed.hasOwnProperty("versions")) {
        this.setState({ versions: parsed.versions });
        logger.info("Fetched Minecraft launcher meta");
      }
    });
  }
  render(): JSX.Element {
    return (
      <Container className="p-3 eph-h-full overflow-y-scroll">
        <div className="flex space-x-3">
          <Checkbox
            checked={this.state.release}
            onChange={(checked) => this.setState({ release: checked })}
          >
            {t.release}
          </Checkbox>
          <Checkbox
            checked={this.state.snapshot}
            onChange={(checked) => this.setState({ snapshot: checked })}
          >
            {t.snapshot}
          </Checkbox>
          <Checkbox
            checked={this.state.old}
            onChange={(checked) => this.setState({ old: checked })}
          >
            {t.old}
          </Checkbox>
        </div>
        {this.state.versions ? (
          <List>
            {this.state.versions.map(
              (item, index) =>
                this.matchType(item.type) && (
                  <ListItem
                    className="rounded-lg p-2"
                    onClick={() =>
                      showDialog((close) => <DownloadDialog version={item} onClose={close} />)
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
}
