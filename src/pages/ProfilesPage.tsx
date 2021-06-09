import { Component } from "react";
import ListItemText from "../components/ListItemText";
import Button from "../components/Button";
import Container from "../components/Container";
import Icon from "../components/Icon";
import IconButton from "../components/IconButton";
import Radio from "../components/Radio";
import Tooltip from "../components/Tooltip";
import { MinecraftProfile } from "../renderer/profiles";
import { hist, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { EmptyProps, EmptyState } from "../tools/types";
import ListItem from "../components/ListItem";
import List from "../components/List";
import Alert from "../components/Alert";
import { showDialog } from "../renderer/overlay";
import { CreateProfileDialog, EditProfileDialog, RemoveProfileDialog } from "../components/Dialogs";

export default class ProfilesPage extends Component<EmptyProps, EmptyState> {
  render(): JSX.Element {
    const profiles = ephConfigs.profiles;
    return (
      <Container className="mb-3">
        <div className="flex space-x-3 my-3">
          <Button
            variant="contained"
            onClick={() =>
              showDialog((close) => (
                <CreateProfileDialog onClose={close} updateProfiles={() => this.setState({})} />
              ))
            }
          >
            <Icon>create</Icon> {t("create")}
          </Button>
          <Button variant="contained" onClick={() => hist.push("/downloads")}>
            <Icon>file_download</Icon> {t("download")}
          </Button>
        </div>
        {profiles.length === 0 && <Alert severity="info">{t("noProfilesYet")}</Alert>}
        <List className="pl-3">
          {profiles.map((i: MinecraftProfile) => (
            <ListItem key={i.id}>
              <Radio
                checked={ephConfigs.selectedProfile === i.id}
                className="self-center mr-3"
                onChange={(checked: boolean) =>
                  checked
                    ? (() => {
                        setConfig(() => (ephConfigs.selectedProfile = i.id));
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={i.dir} className="flex-grow" />
              <Tooltip title={t("edit")}>
                <IconButton
                  onClick={() =>
                    showDialog((close) => (
                      <EditProfileDialog
                        onClose={close}
                        updateProfiles={() => this.setState({})}
                        id={i.id}
                      />
                    ))
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
                    showDialog((close) => (
                      <RemoveProfileDialog
                        onClose={close}
                        updateProfiles={() => this.setState({})}
                        id={i.id}
                      />
                    ))
                  }
                >
                  <Icon>delete</Icon>
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Container>
    );
  }
}
