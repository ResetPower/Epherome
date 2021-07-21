import { Button, TextField } from "../components/inputs";
import { Typography } from "../components/layouts";
import { createProfile, editProfile, getProfile, MinecraftProfile } from "../struct/profiles";
import { hist, logger, t } from "../renderer/global";
import { ephConfigs, setConfig } from "../renderer/config";
import { RemoveProfileDialog } from "../components/Dialogs";
import { MdCreate, MdFileDownload, MdFolder } from "react-icons/md";
import { List, ListItem, ListItemText } from "../components/lists";
import { useController, useForceUpdater } from "../tools/hooks";
import GlobalOverlay from "../components/GlobalOverlay";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { useCallback, useState } from "react";
import { ipcRenderer } from "electron";
import { DefaultFunction } from "../tools/types";
import { useEffect } from "react";
import fs from "fs";
import path from "path";

export function ChangeProfileFragment(props: {
  onDone: DefaultFunction;
  action: "edit" | "create";
  current?: MinecraftProfile;
}): JSX.Element {
  const current = props.current;
  const nameController = useController(current?.name ?? "");
  const dirController = useController(current?.dir ?? "");
  const verController = useController(current?.ver ?? "");

  const handleEdit = () => {
    if (current) {
      editProfile(current.id, nameController.value, dirController.value, verController.value);
      props.onDone();
    }
  };
  const handleCreate = () => {
    if (createProfile(nameController.value, dirController.value, verController.value)) {
      props.onDone();
    }
  };
  const handleOpenDirectory = () => {
    ipcRenderer.once("replyOpenDirectory", (_ev, arg) => {
      dirController.onChange(arg);
    });
    ipcRenderer.send("openDirectory");
  };
  return (
    <>
      {props.action === "create" && (
        <Typography className="text-xl font-semibold">{t.newProfile}</Typography>
      )}
      <div>
        <TextField label={t.name} {...nameController} />
        <TextField label={t.directory} {...dirController} helperText={t.usuallyDotMinecraftEtc} />
        <TextField label={t.version} {...verController} />
      </div>
      <div className="flex">
        <Button onClick={handleOpenDirectory}>
          <MdFolder /> {t.openDirectory}
        </Button>
        <div className="flex-grow"></div>
        <Button className="text-shallow" onClick={props.onDone}>
          {t.cancel}
        </Button>
        {props.action === "create" ? (
          <Button onClick={handleCreate}>{t.create}</Button>
        ) : (
          <Button onClick={handleEdit}>{t.edit}</Button>
        )}
      </div>
    </>
  );
}

export default function ProfilesPage(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const profiles = ephConfigs.profiles;
  const selected = ephConfigs.selectedProfile;
  const [mapsList, setMapsList] = useState<string[]>([]);
  const [resourcePacksList, setResourcePacksList] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const createProfile = () => setCreating(true);
  const removeProfile = useCallback(
    () =>
      GlobalOverlay.showDialog((close) => (
        <RemoveProfileDialog onClose={close} updateProfiles={forceUpdate} id={selected} />
      )),
    [forceUpdate, selected]
  );
  const current = getProfile(selected);

  useEffect(() => {
    if (current) {
      fs.readdir(path.join(current.dir, "saves"), (err, files) => {
        if (!err) {
          setMapsList(files);
        }
      });
      fs.readdir(path.join(current.dir, "resourcepacks"), (err, files) => {
        if (!err) {
          setResourcePacksList(files);
        }
      });
    }
  }, [current]);

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
              checked={!creating && selected === i.id}
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
      {creating ? (
        <div className="border-l border-divide p-3">
          <ChangeProfileFragment
            action="create"
            onDone={() => {
              setCreating(false);
              forceUpdate();
            }}
          />
        </div>
      ) : (
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
              {current && (
                <ChangeProfileFragment action="edit" onDone={forceUpdate} current={current} />
              )}
            </div>
            <div>
              {mapsList.map(
                (m, index) =>
                  m !== ".DS_Store" && (
                    /* avoid useless .DS_Store file on macOS */ <Typography key={index}>
                      {m}
                    </Typography>
                  )
              )}
            </div>
            <div>
              {resourcePacksList.map(
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
      )}
    </div>
  );
}
