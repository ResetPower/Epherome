import { Component } from "react";
import { Button, IconButton, Radio } from "../components/inputs";
import Tooltip from "../components/Tooltip";
import { MinecraftProfile } from "../struct/profiles";
import { hist, logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { EmptyObject } from "../tools/types";
import Alert from "../components/Alert";
import { showDialog } from "../renderer/overlay";
import { CreateProfileDialog, EditProfileDialog, RemoveProfileDialog } from "../components/Dialogs";
import { MdCreate, MdDelete, MdEdit, MdFileDownload, MdSettings } from "react-icons/md";
import Container from "../components/Container";
import { List, ListItem, ListItemText } from "../components/lists";

export default class ProfilesPage extends Component<EmptyObject, EmptyObject> {
  render(): JSX.Element {
    const profiles = ephConfigs.profiles;
    return (
      <Container>
        <div className="flex space-x-3 my-3">
          <Button
            variant="contained"
            onClick={() =>
              showDialog((close) => (
                <CreateProfileDialog onClose={close} updateProfiles={() => this.setState({})} />
              ))
            }
          >
            <MdCreate /> {t.create}
          </Button>
          <Button variant="contained" onClick={() => hist.push("/downloads")}>
            <MdFileDownload /> {t.download}
          </Button>
        </div>
        {profiles.length === 0 && <Alert severity="info">{t.noProfilesYet}</Alert>}
        <List>
          {profiles.map((i: MinecraftProfile) => (
            <ListItem key={i.id}>
              <Radio
                checked={ephConfigs.selectedProfile === i.id}
                className="self-center mr-3"
                onChange={(checked: boolean) =>
                  checked
                    ? (() => {
                        logger.info(`Profile selection changed to id ${i.id}`);
                        setConfig(() => (ephConfigs.selectedProfile = i.id));
                        this.setState({});
                      })()
                    : null
                }
              />
              <ListItemText primary={i.name} secondary={i.dir} className="flex-grow" />
              <Tooltip title={t.edit}>
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
                  <MdEdit />
                </IconButton>
              </Tooltip>
              <Tooltip title={t.manage}>
                <IconButton
                  onClick={() => {
                    hist.push("/profile", { id: i.id.toString() });
                  }}
                >
                  <MdSettings />
                </IconButton>
              </Tooltip>
              <Tooltip title={t.remove}>
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
                  <MdDelete />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>
      </Container>
    );
  }
}
