import { Button, TextField } from "../components/inputs";
import { Typography } from "../components/layouts";
import {
  createProfile,
  editProfile,
  MinecraftProfile,
  removeProfile,
} from "../struct/profiles";
import { logger } from "../renderer/global";
import { configStore, setConfig } from "../struct/config";
import {
  MdCreate,
  MdDelete,
  MdFileDownload,
  MdFolder,
  MdGamepad,
} from "react-icons/md";
import { List, ListItem } from "../components/lists";
import { showDialog } from "../renderer/overlays";
import { TabBar, TabBarItem, TabBody, TabController } from "../components/tabs";
import { ipcRenderer } from "electron";
import { DefaultFn } from "../tools";
import fs from "fs";
import path from "path";
import { useState, useCallback } from "react";
import { t } from "../intl";
import { historyStore } from "../renderer/history";
import { _ } from "../tools/arrays";
import { ConfirmDialog } from "../components/Dialog";
import { observer } from "mobx-react";

export function RemoveProfileDialog(props: {
  onClose: DefaultFn;
  profile: MinecraftProfile;
}): JSX.Element {
  return (
    <ConfirmDialog
      title={t("removeProfile")}
      message={t("confirmRemoving")}
      action={() => removeProfile(props.profile)}
      close={props.onClose}
      positiveClassName="text-red-500"
      positiveText={t("remove")}
    />
  );
}

export function ChangeProfileFragment(props: {
  onDone: DefaultFn;
  action: "edit" | "create";
  current?: MinecraftProfile;
}): JSX.Element {
  const current = props.current;
  const [name, setName] = useState(current?.name ?? "");
  const [dir, setDir] = useState(current?.dir ?? "");
  const [ver, setVer] = useState(current?.ver ?? "");
  const [jvmArgs, setJvmArgs] = useState(current?.jvmArgs ?? "");

  const handleEdit = () => {
    if (current) {
      editProfile(current, {
        name,
        dir,
        ver,
        jvmArgs,
      });
      props.onDone();
    }
  };
  const handleCreate = () => {
    if (
      createProfile({
        name,
        dir,
        ver,
        from: "create",
        jvmArgs,
      })
    ) {
      props.onDone();
    }
  };
  const handleOpenDirectory = () => {
    ipcRenderer.once("replyOpenDirectory", (_ev, arg) => setDir(arg));
    ipcRenderer.send("openDirectory");
  };

  return (
    <div className="p-3">
      {props.action === "create" && <div className="h-12" />}
      <div>
        <TextField label={t("name")} value={name} onChange={setName} />
        <TextField
          label={t("directory")}
          value={dir}
          onChange={setDir}
          helperText={t("usuallyDotMinecraftEtc")}
        />
        <TextField label={t("version")} value={ver} onChange={setVer} />
        <TextField
          label="JVM Arguments"
          value={jvmArgs}
          onChange={setJvmArgs}
        />
      </div>
      <div className="flex">
        <Button onClick={handleOpenDirectory}>
          <MdFolder /> {t("openDirectory")}
        </Button>
        <div className="flex-grow" />
        {props.action === "create" ? (
          <>
            <Button className="text-shallow" onClick={props.onDone}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreate}>{t("create")}</Button>
          </>
        ) : (
          <Button onClick={handleEdit}>{t("save")}</Button>
        )}
      </div>
    </div>
  );
}

const ProfilesPage = observer(() => {
  const [creating, setCreating] = useState(false);
  const handleCreate = useCallback(() => setCreating(true), []);
  const handleRemove = useCallback(
    (selected: MinecraftProfile) =>
      showDialog((close) => (
        <RemoveProfileDialog onClose={close} profile={selected} />
      )),
    []
  );
  const profiles = configStore.profiles;
  const current = _.selected(profiles);
  let mapsList: string[] = [];
  let resourcePacksList: string[] = [];

  if (current) {
    try {
      mapsList = fs.readdirSync(path.join(current.dir, "saves"));
      resourcePacksList = fs.readdirSync(
        path.join(current.dir, "resourcepacks")
      );
    } catch {}
  }

  return (
    <div className="flex eph-h-full">
      <div className="overflow-y-auto py-3 w-1/4">
        <div className="flex my-3 justify-center">
          <Button variant="contained" onClick={handleCreate}>
            <MdCreate /> {t("create")}
          </Button>
          <Button
            variant="contained"
            onClick={() => historyStore.push("downloads")}
          >
            <MdFileDownload /> {t("download")}
          </Button>
        </div>
        <List className="space-y-1">
          {profiles.map((i: MinecraftProfile, index) => (
            <ListItem
              className="p-3 mx-2 rounded-lg"
              checked={!creating && current === i}
              onClick={() => {
                logger.info(`Profile selection changed`);
                setConfig(() => _.select(profiles, i));
              }}
              key={index}
            >
              <Typography className="flex">
                {i.from === "download" ? <MdFileDownload /> : <MdGamepad />}{" "}
                {i.name}
              </Typography>
            </ListItem>
          ))}
        </List>
      </div>
      <div className="border-l border-divider flex-grow p-3 w-3/4 h-full">
        {creating ? (
          <ChangeProfileFragment
            action="create"
            onDone={() => setCreating(false)}
          />
        ) : current ? (
          <TabController orientation="horizontal">
            <TabBar>
              <TabBarItem value={0}>{t("general")}</TabBarItem>
              <TabBarItem value={1}>{t("edit")}</TabBarItem>
              <TabBarItem value={2}>{t("maps")}</TabBarItem>
              <TabBarItem value={3}>{t("resourcePacks")}</TabBarItem>
              <TabBarItem value={4}>Mods</TabBarItem>
            </TabBar>
            <TabBody>
              <div className="flex flex-col">
                <div className="flex-grow">
                  <Typography>
                    {t("name")}: {current?.name}
                  </Typography>
                  <Typography>
                    {t("directory")}: {current?.dir}
                  </Typography>
                  <Typography>
                    {t("version")}: {current?.ver}
                  </Typography>
                </div>
                <div className="flex justify-end">
                  <Button
                    className="text-red-500"
                    onClick={() => current && handleRemove(current)}
                  >
                    <MdDelete />
                    {t("remove")}
                  </Button>
                </div>
              </div>
              <div>
                {current && (
                  <ChangeProfileFragment
                    action="edit"
                    onDone={() => setCreating(false)}
                    current={current}
                  />
                )}
              </div>
              <div>
                {mapsList.map(
                  (m, index) =>
                    m !== ".DS_Store" && (
                      /* avoid useless .DS_Store file on macOS */ <Typography
                        key={index}
                      >
                        {m}
                      </Typography>
                    )
                )}
              </div>
              <div>
                {resourcePacksList.map(
                  (m, index) =>
                    m !== ".DS_Store" && (
                      /* avoid useless .DS_Store file on macOS */ <Typography
                        key={index}
                      >
                        {m}
                      </Typography>
                    )
                )}
              </div>
              <div>
                <Typography>{t("notSupportedYet")}</Typography>
              </div>
            </TabBody>
          </TabController>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-shallow">{t("noProfilesYet")}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ProfilesPage;
