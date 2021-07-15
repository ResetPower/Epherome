import Alert from "../components/Alert";
import { Component } from "react";
import { t } from "../renderer/global";
import { getProfile, MinecraftProfile } from "../struct/profiles";
import fs from "fs";
import Typography from "../components/Typography";
import { StringMap } from "../tools/types";
import Container from "../components/Container";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { MdMap, MdWrapText } from "react-icons/md";

export interface ProfileManagementPageProps {
  params: StringMap;
}

export interface ProfileManagementPageState {
  value: number;
  mapsList: string[];
  resourcePacksList: string[];
}

export default class ProfileManagementPage extends Component<
  ProfileManagementPageProps,
  ProfileManagementPageState
> {
  state: ProfileManagementPageState = {
    value: 0,
    mapsList: [],
    resourcePacksList: [],
  };
  profile: MinecraftProfile | null;
  constructor(props: ProfileManagementPageProps) {
    super(props);
    this.profile = getProfile(parseInt(this.props.params.id));
  }
  async componentDidMount(): Promise<void> {
    if (this.profile !== null) {
      const mapsDir = fs.readdirSync(`${this.profile.dir}/saves`);
      const resourcesDir = fs.readdirSync(`${this.profile.dir}/resourcepacks`);
      this.setState({ mapsList: mapsDir, resourcePacksList: resourcesDir });
    }
  }
  render(): JSX.Element {
    return this.profile === null ? (
      <Container>
        <Alert severity="error">Sorry. Profile Id Not Found.</Alert>
      </Container>
    ) : (
      <TabController>
        <TabBar>
          <TabBarItem value={0}>
            <MdMap /> {t.maps}
          </TabBarItem>
          <TabBarItem value={1}>
            <MdWrapText /> {t.resourcePacks}
          </TabBarItem>
        </TabBar>
        <TabBody>
          <div hidden={this.state.value !== 0}>
            {this.state.mapsList.map(
              (m, index) =>
                m !== ".DS_Store" && (
                  /* avoid useless .DS_Store file on macOS */ <Typography key={index}>
                    {m}
                  </Typography>
                )
            )}
          </div>
          <div hidden={this.state.value !== 1}>
            {this.state.resourcePacksList.map(
              (m, index) =>
                m !== ".DS_Store" && (
                  /* avoid useless .DS_Store file on macOS */ <Typography key={index}>
                    {m}
                  </Typography>
                )
            )}
          </div>
        </TabBody>
      </TabController>
    );
  }
}
