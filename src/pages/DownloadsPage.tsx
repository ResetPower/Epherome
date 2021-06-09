import { Component } from "react";
import { EmptyProps } from "../tools/types";
import Container from "../components/Container";
import Checkbox from "../components/Checkbox";
import List from "../components/List";
import { ephFetch } from "../tools/http";
import { isSuccess } from "../tools/auth";
import { MinecraftVersion, MinecraftVersionType } from "../core/rules";
import Typography from "../components/Typography";
import { t } from "../renderer/global";

interface DownloadsPageState {
  release: boolean;
  snapshot: boolean;
  old: boolean;
  versions: MinecraftVersion[];
}

export default class DownloadsPage extends Component<EmptyProps, DownloadsPageState> {
  state: DownloadsPageState = {
    release: true,
    snapshot: false,
    old: false,
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
    ephFetch("https://launchermeta.mojang.com/mc/game/version_manifest.json").then((res) => {
      if (isSuccess(res.status)) {
        const parsed = JSON.parse(res.text);
        if (parsed.hasOwnProperty("versions")) {
          this.setState({ versions: parsed.versions });
        }
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
            {t("release")}
          </Checkbox>
          <Checkbox
            checked={this.state.snapshot}
            onChange={(checked) => this.setState({ snapshot: checked })}
          >
            {t("snapshot")}
          </Checkbox>
          <Checkbox
            checked={this.state.old}
            onChange={(checked) => this.setState({ old: checked })}
          >
            {t("old")}
          </Checkbox>
        </div>
        <List>
          {this.state.versions.map((item, index) => {
            return this.matchType(item.type) && <Typography key={index}>{item.id}</Typography>;
          })}
        </List>
      </Container>
    );
  }
}
