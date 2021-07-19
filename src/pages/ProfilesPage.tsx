import { Button } from "../components/inputs";
import { Typography } from "../components/layouts";
import { getProfile, MinecraftProfile } from "../struct/profiles";
import { hist, logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { CreateProfileDialog, EditProfileDialog, RemoveProfileDialog } from "../components/Dialogs";
import { MdCreate, MdEdit, MdFileDownload } from "react-icons/md";
import { List, ListItem, ListItemText } from "../components/lists";
import { useForceUpdater } from "../tools/hooks";
import GlobalOverlay from "../components/GlobalOverlay";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { useCallback } from "react";

export default function ProfilesPage(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const profiles = ephConfigs.profiles;
  const selected = ephConfigs.selectedProfile;
  const createProfile = useCallback(
    () =>
      GlobalOverlay.showDialog((close) => (
        <CreateProfileDialog onClose={close} updateProfiles={forceUpdate} />
      )),
    [forceUpdate]
  );
  const editProfile = useCallback(
    () =>
      GlobalOverlay.showDialog((close) => (
        <EditProfileDialog onClose={close} updateProfiles={forceUpdate} id={selected} />
      )),
    [forceUpdate, selected]
  );
  const removeProfile = useCallback(
    () =>
      GlobalOverlay.showDialog((close) => (
        <RemoveProfileDialog onClose={close} updateProfiles={forceUpdate} id={selected} />
      )),
    [forceUpdate, selected]
  );
  const current = getProfile(selected);

  return profiles.length === 0 ? (
    <div className="flex flex-col eph-h-full justify-center items-center">
      <Typography className="text-shallow" textInherit>
        {t.noAccountsYet}
      </Typography>
      <Button variant="contained" onClick={createProfile}>
        <MdCreate />
        {t.create}
      </Button>
    </div>
  ) : (
    <div className="flex eph-h-full">
      <div className="overflow-y-scroll py-3">
        <div className="flex space-x-3 my-3">
          <Button variant="contained" onClick={createProfile}>
            <MdCreate /> {t.create}
          </Button>
          <Button variant="contained" onClick={() => hist.push("/downloads")}>
            <MdFileDownload /> {t.download}
          </Button>
        </div>
        <List>
          {profiles.map((i: MinecraftProfile) => (
            <ListItem
              checked={selected === i.id}
              onClick={() => {
                logger.info(`Profile selection changed to id ${i.id}`);
                setConfig(() => (ephConfigs.selectedProfile = i.id));
                forceUpdate();
              }}
              key={i.id}
            >
              <ListItemText primary={i.name} secondary={i.dir} className="flex-grow" />
            </ListItem>
          ))}
        </List>
      </div>
      <TabController className="flex-grow p-3" orientation="horizontal">
        <TabBar>
          <TabBarItem value={0}>{t.general}</TabBarItem>
          <TabBarItem value={1}>{t.edit}</TabBarItem>
          <TabBarItem value={2}>{t.maps}</TabBarItem>
          <TabBarItem value={3}>{t.resourcePacks}</TabBarItem>
        </TabBar>
        <TabBody>
          <div className="flex flex-col">
            <div className="flex-grow">
              <Typography>ID: {current?.id}</Typography>
              <Typography>
                {t.name}: {current?.name}
              </Typography>
              <Typography>
                {t.directory}: {current?.dir}
              </Typography>
              <Typography>
                {t.version}: {current?.ver}
              </Typography>
            </div>
            <div className="flex justify-end">
              <Button className="text-red-500" onClick={removeProfile} textInherit>
                {t.remove}
              </Button>
            </div>
          </div>
          <div>
            <Typography>
              <Button variant="contained" onClick={editProfile}>
                <MdEdit /> {t.edit}
              </Button>
            </Typography>
          </div>
        </TabBody>
      </TabController>
    </div>
  );
}
