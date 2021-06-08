import { Component } from "react";
import { EmptyProps } from "../tools/types";
import Container from "../components/Container";

interface DownloadsPageState {
  release: boolean;
  snapshot: boolean;
  old: boolean;
}

export default class DownloadsPage extends Component<EmptyProps, DownloadsPageState> {
  constructor(props: EmptyProps) {
    super(props);
    fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")
      .then((res) => res.json())
      .then((data: { [key: string]: string }) => {
        if (data.hasOwnProperty("")) {
        }
      });
  }
  render(): JSX.Element {
    return <Container> </Container>;
  }
}
