import { Component } from "react";
import { EmptyObject } from "../tools/types";
import { Checkbox } from "../components/inputs";
import { MinecraftVersion, MinecraftVersionType } from "../core/versions";
import { logger, t } from "../renderer/global";
import Spin from "../components/Spin";
import { DownloadDialog } from "../components/Dialogs";
import got from "got";
import { Container } from "../components/layouts";
import { List, ListItem, ListItemText } from "../components/lists";
import GlobalOverlay from "../components/GlobalOverlay";

interface DownloadsPageState {
  release: boolean;
  snapshot: boolean;
  old: boolean;
  versions?: MinecraftVersion[];
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
      <Container className="p-3">
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
                      GlobalOverlay.showDialog((close) => <DownloadDialog onClose={close} />)
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
