import Container from "../components/Container";
import Alert from "../components/Alert";
import { Component, ReactNode } from "react";
import { t } from "../renderer/global";
import { getProfile, MinecraftProfile } from "../renderer/profiles";
import fs from "fs";
import Typography from "../components/Typography";

export interface ProfileManagementPageProps {
  params: { [key: string]: string };
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
  TabItem = (props: { children: ReactNode; value: number }): JSX.Element => {
    return (
      <button
        className={`block focus:outline-none ${
          this.state.value === props.value ? "text-pink-500" : "text-black dark:text-white"
        }`}
        onClick={() => this.setState({ value: props.value })}
      >
        {props.children}
      </button>
    );
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
    return (
      <Container>
        {this.profile === null ? (
          <Alert severity="error">Sorry. Profile Id Not Found.</Alert>
        ) : (
          <div className="flex">
            <div className="p-6 border-r border-divide">
              <this.TabItem value={0}>{t.maps}</this.TabItem>
              <this.TabItem value={1}>{t.resourcePacks}</this.TabItem>
            </div>
            <div className="p-3 flex-grow">
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
            </div>
          </div>
        )}
      </Container>
    );
  }
}
