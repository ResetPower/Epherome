import { Component } from "react";
import { EmptyProps } from "../tools/types";
import Container from "../components/Container";
import Checkbox from "../components/Checkbox";
import List from "../components/List";
import { MinecraftVersion, MinecraftVersionType } from "../core/rules";
import { t } from "../renderer/global";
import ListItem from "../components/ListItem";
import ListItemText from "../components/ListItemText";
import Spin from "../components/Spin";
import { showDialog } from "../renderer/overlay";
import { DownloadDialog } from "../components/Dialogs";
import got from "got";

interface DownloadsPageState {
  release: boolean;
  snapshot: boolean;
  old: boolean;
  loading: boolean;
  versions: MinecraftVersion[];
}

export default class DownloadsPage extends Component<EmptyProps, DownloadsPageState> {
  state: DownloadsPageState = {
    release: true,
    snapshot: false,
    old: false,
    loading: true,
    versions: [],
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
    got("https://launchermeta.mojang.com/mc/game/version_manifest.json").then((resp) => {
      const parsed = JSON.parse(resp.body);
      if (parsed.hasOwnProperty("versions")) {
        this.setState({ versions: parsed.versions, loading: false });
      }
    });
  }
  render(): JSX.Element {
    return (
      <Container>
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
        {this.state.loading && <Spin />}
        <List className="space-y-0">
          {this.state.versions.map((item, index) => {
            return (
              this.matchType(item.type) && (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.id}
                    secondary={item.type}
                    className="cursor-pointer"
                    onClick={() => {
                      showDialog((close) => <DownloadDialog onClose={close} />);
                    }}
                  />
                </ListItem>
              )
            );
          })}
        </List>
      </Container>
    );
  }
}
