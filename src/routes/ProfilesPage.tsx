import { Component } from "react";
import {
  Button,
  Container,
  Icon,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Radio,
  Tooltip,
} from "@material-ui/core";
import { CreateProfileDialog, EditProfileDialog, RemoveProfileDialog } from "../components/Dialogs";
import { MinecraftProfile } from "../renderer/profiles";
import { hist, t } from "../renderer/global";
import Paragraph from "../components/Paragraph";
import { Alert } from "@material-ui/lab";
import { ephConfigs } from "../renderer/config";
import { EmptyProps } from "../tools/types";

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
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.setState({ createDialog: true })}
          >
            <Icon>create</Icon> {t("create")}
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
                onChange={(_ev: React.ChangeEvent, checked: boolean) =>
                  checked
                    ? (() => {
                        ephConfigs.selectedProfile = i.id;
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={i.dir} />
              <ListItemSecondaryAction>
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
                      hist.push("/profile/" + i.id);
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
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <CreateProfileDialog
          open={this.state.createDialog}
          onClose={() => this.setState({ createDialog: false })}
          updateProfiles={() => this.setState({})}
        />
        <EditProfileDialog
          open={this.state.editDialog}
          id={this.state.clicked}
          onClose={() => this.setState({ editDialog: false })}
          updateProfiles={() => this.setState({})}
        />
        <RemoveProfileDialog
          open={this.state.removeDialog}
          onClose={() => this.setState({ removeDialog: false })}
          updateProfiles={() => this.setState({})}
          id={this.state.clicked}
        />
      </Container>
    );
  }
}
