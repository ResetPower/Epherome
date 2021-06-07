import { ChangeEvent, Component } from "react";
import ListItemText from "../components/ListItemText";
import Button from "../components/Button";
import Container from "../components/Container";
import Icon from "../components/Icon";
import IconButton from "../components/IconButton";
import Radio from "../components/Radio";
import Tooltip from "../components/Tooltip";
import { MinecraftProfile } from "../renderer/profiles";
import { hist, t } from "../renderer/global";
import Paragraph from "../components/Paragraph";
import { ephConfigs, setConfig } from "../renderer/config";
import { EmptyProps } from "../tools/types";
import ListItem from "../components/ListItem";
import ListItemTrailing from "../components/ListItemTrailing";
import List from "../components/List";
import Alert from "../components/Alert";

export interface ProfilesPageState {
  clicked: number;
  createDialog: boolean;
  editDialog: boolean;
  removeDialog: boolean;
}

export default class ProfilesPage extends Component<EmptyProps, ProfilesPageState> {
  state: ProfilesPageState = {
    clicked: 0,
    createDialog: false,
    editDialog: false,
    removeDialog: false,
  };
  render(): JSX.Element {
    const profiles = ephConfigs.profiles;
    return (
      <Container className="eph-page">
        <Paragraph padding="both">
          <Button variant="contained" onClick={() => this.setState({ createDialog: true })}>
            <Icon>create</Icon> {t("create")}
          </Button>
          <span style={{ padding: "5px" }} />
          <Button variant="contained" onClick={() => hist.push("/downloads")}>
            <Icon>file_download</Icon> {t("download")}
          </Button>
        </Paragraph>
        {profiles.length === 0 && (
          <Paragraph padding="top">
            <Alert severity="info">{t("noProfilesYet")}</Alert>
          </Paragraph>
        )}
        <List>
          {profiles.map((i: MinecraftProfile) => (
            <ListItem key={i.id}>
              <Radio
                checked={ephConfigs.selectedProfile === i.id}
                onChange={(checked: boolean) =>
                  checked
                    ? (() => {
                        setConfig(() => (ephConfigs.selectedProfile = i.id));
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={i.dir} />
              <ListItemTrailing>
                <Tooltip title={t("edit")}>
                  <IconButton
                    onClick={() =>
                      this.setState({
                        clicked: i.id,
                        editDialog: true,
                      })
                    }
                  >
                    <Icon>edit</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("manage")}>
                  <IconButton
                    onClick={() => {
                      hist.push("/profile", { id: i.id.toString() });
                    }}
                  >
                    <Icon>settings</Icon>
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("remove")}>
                  <IconButton
                    onClick={() =>
                      this.setState({
                        clicked: i.id,
                        removeDialog: true,
                      })
                    }
                  >
                    <Icon>delete</Icon>
                  </IconButton>
                </Tooltip>
              </ListItemTrailing>
            </ListItem>
          ))}
        </List>
      </Container>
    );
  }
}
