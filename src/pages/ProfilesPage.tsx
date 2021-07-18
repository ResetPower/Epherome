import { Button, IconButton, Radio } from "../components/inputs";
import { Tooltip, Alert, Container } from "../components/layouts";
import { MinecraftProfile } from "../struct/profiles";
import { hist, logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { CreateProfileDialog, EditProfileDialog, RemoveProfileDialog } from "../components/Dialogs";
import { MdCreate, MdDelete, MdEdit, MdFileDownload, MdSettings } from "react-icons/md";
import { List, ListItem, ListItemText } from "../components/lists";
import { useForceUpdater } from "../tools/hooks";
import GlobalOverlay from "../components/GlobalOverlay";

export default function ProfilesPage(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const profiles = ephConfigs.profiles;

  return (
    <Container>
      <div className="flex space-x-3 my-3">
        <Button
          variant="contained"
          onClick={() =>
            GlobalOverlay.showDialog((close) => (
              <CreateProfileDialog onClose={close} updateProfiles={forceUpdate} />
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
                      forceUpdate();
                    })()
                  : null
              }
            />
            <ListItemText primary={i.name} secondary={i.dir} className="flex-grow" />
            <Tooltip title={t.edit}>
              <IconButton
                onClick={() =>
                  GlobalOverlay.showDialog((close) => (
                    <EditProfileDialog onClose={close} updateProfiles={forceUpdate} id={i.id} />
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
                  GlobalOverlay.showDialog((close) => (
                    <RemoveProfileDialog onClose={close} updateProfiles={forceUpdate} id={i.id} />
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
