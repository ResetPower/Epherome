import {
  Button,
  Checkbox,
  Link,
  Select,
  TextField,
  TinyButton,
} from "../components/inputs";
import {
  createProfile,
  editProfile,
  MinecraftProfile,
} from "../struct/profiles";
import { configStore, setConfig } from "../struct/config";
import {
  MdCreate,
  MdExpandLess,
  MdExpandMore,
  MdFileDownload,
  MdGamepad,
} from "react-icons/md";
import { List, ListItem } from "../components/lists";
import {
  TabBar,
  TabBarItem,
  TabBody,
  TabContext,
  TabController,
} from "../components/tabs";
import { ipcRenderer } from "electron";
import { call, DefaultFn } from "../tools";
import { useState, useRef, useCallback } from "react";
import { t } from "../intl";
import { historyStore } from "../renderer/history";
import { _ } from "../tools/arrays";
import { observer } from "mobx-react";
import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";
import { useMemo } from "react";
import { MinecraftProfileManagerStore } from "../craft/manager";
import { defaultJvmArgs } from "../craft/jvm";
import {
  ProfileGeneralFragment,
  ProfileModsFragment,
  ProfileResourcePacksFragment,
  ProfileSavesFragment,
} from "./ProfileManagers";
import { Center } from "../components/fragments";

export function ChangeProfileFragment(props: {
  onDone?: DefaultFn;
  action: "edit" | "create";
  current?: MinecraftProfile;
}): JSX.Element {
  const flag = useRef(true);
  const [more, setMore] = useState(false);
  const current = props.current;
  const [name, setName] = useState(current?.name ?? "");
  const [dir, setDir] = useState(current?.dir ?? "");
  const [ver, setVer] = useState(current?.ver ?? "");
  const [jvmArgs, setJvmArgs] = useState(current?.jvmArgs ?? defaultJvmArgs());
  const [resolution, setResolution] = useState(current?.resolution ?? {});
  const [java, setJava] = useState(current?.java ?? "");
  const [showEpherome, setShowEpherome] = useState(
    current?.showEpherome ?? true
  );
  const [gameDirIsolation, setGameDirIsolation] = useState(
    current?.gameDirIsolation ?? false
  );

  const handleCreate = () => {
    if (
      createProfile({
        name,
        dir,
        ver,
        from: "create",
        jvmArgs,
        resolution,
        java,
        gameDirIsolation,
      })
    ) {
      call(props.onDone);
    }
  };
  const handleEdit = useCallback(() => {
    if (current) {
      editProfile(current, {
        name,
        dir,
        ver,
        jvmArgs,
        resolution,
        java,
        gameDirIsolation,
      });
      call(props.onDone);
    }
  }, [
    name,
    dir,
    ver,
    jvmArgs,
    resolution,
    java,
    gameDirIsolation,
    props.onDone,
    current,
  ]);
  const handleResolutionChange = (type: "width" | "height", ev: string) => {
    if (ev === "") {
      setResolution((prev) => ({ ...prev, [type]: undefined }));
    } else {
      const num = +ev;
      num >= 0 && setResolution((prev) => ({ ...prev, [type]: num }));
    }
  };
  const handleOpenDirectory = () =>
    ipcRenderer
      .invoke("open-directory")
      .then((value) => value && setDir(value));

  useEffect(
    () => () => {
      flag.current = false;
    },
    []
  );
  useEffect(
    () => () => {
      !flag.current && handleEdit();
    },
    [handleEdit]
  );

  return (
    <div className="p-1">
      {props.action === "create" && <div className="h-12" />}
      <div>
        <TextField
          label={t("name")}
          value={name}
          maxLength={32}
          onChange={setName}
          required
        />
        <TextField
          label={t("directory")}
          value={dir}
          onChange={setDir}
          helperText={t("profile.usuallyDotMinecraftEtc")}
          trailing={
            <Link type="clickable" onClick={handleOpenDirectory}>
              {t("profile.openDirectory")}
            </Link>
          }
          required
        />
        <TextField
          label={t("version")}
          value={ver}
          onChange={setVer}
          required
        />
        {more && (
          <>
            <div className="flex">
              <Checkbox
                className="m-1"
                checked={gameDirIsolation}
                onChange={setGameDirIsolation}
              >
                {t("profile.gameDirIsolation")}
              </Checkbox>
              <div className="flex-grow" />
              <Checkbox
                className="m-1"
                checked={showEpherome}
                onChange={setShowEpherome}
              >
                {t("profile.showEpherome")}
              </Checkbox>
            </div>
            <p className="eph-helper-text text-left">
              {t("profile.gameDirIsolation.description")}
            </p>
            <p className="eph-helper-text text-right">
              {t("profile.showEpherome.description")}
            </p>
            <div className="flex items-center space-x-3">
              <TextField
                className="flex-grow"
                label={t("profile.jvmArgs")}
                value={jvmArgs}
                onChange={setJvmArgs}
              />
              <Select label="Java" value={java} onChange={setJava}>
                <option value="default">{t("useDefault")}</option>
                {configStore.javas.map((val) => (
                  <option value={val.nanoid} key={val.nanoid}>
                    {val.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="eph-label">{t("profile.resolution")}</label>
              <div className="flex items-center">
                <TextField
                  placeholder={t("useDefault")}
                  value={`${resolution.width ?? ""}`}
                  onChange={(ev) => handleResolutionChange("width", ev)}
                  className="flex-grow"
                  noSpinButton
                />
                <FaTimes className="text-contrast m-3" />
                <TextField
                  placeholder={t("useDefault")}
                  value={`${resolution.height ?? ""}`}
                  onChange={(ev) => handleResolutionChange("height", ev)}
                  className="flex-grow"
                  noSpinButton
                />
              </div>
            </div>
          </>
        )}
        <TinyButton onClick={() => setMore((prev) => !prev)} paddingRight>
          {more ? <MdExpandLess /> : <MdExpandMore />}
          {more ? t("collapse") : t("expand")}
        </TinyButton>
      </div>
      <div className="flex justify-end">
        {props.action === "create" ? (
          <>
            <Button className="text-shallow" onClick={props.onDone}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreate} className="text-secondary">
              {t("create")}
            </Button>
          </>
        ) : (
          <Button onClick={handleEdit} className="text-secondary">
            {t("save")}
          </Button>
        )}
      </div>
    </div>
  );
}

const ProfilesPage = observer(() => {
  const tabRef = useRef<TabContext>();
  const [creating, setCreating] = useState(false);
  const handleCreate = () => setCreating(true);
  const profiles = configStore.profiles;
  const current = _.selected(profiles);
  const _key = current?.gameDirIsolation;
  const manager = useMemo(() => {
    _key;
    return current ? new MinecraftProfileManagerStore(current) : undefined;
  }, [_key, current]);

  return (
    <div className="flex eph-h-full">
      <div className="overflow-y-auto bg-card z-10 shadow-md py-3 w-1/4">
        <div className="flex p-2 flex-wrap">
          <Button
            className="whitespace-nowrap"
            variant="contained"
            onClick={handleCreate}
          >
            <MdCreate /> {t("create")}
          </Button>
          <Button
            className="whitespace-nowrap"
            variant="contained"
            onClick={() => historyStore.push("downloads")}
          >
            <MdFileDownload /> {t("download")}
          </Button>
        </div>
        <List className="space-y-1">
          {_.map(profiles, (i, id) => (
            <ListItem
              className="p-3 mx-2 rounded-lg overflow-x-hidden"
              checked={!creating && current === i}
              onClick={() => {
                creating && setCreating(false);
                i.selected
                  ? setConfig(() => _.deselect(profiles))
                  : setConfig(() => _.select(profiles, i));
                tabRef.current?.setValue(0);
              }}
              key={id}
            >
              <p className="flex">
                {i.from === "download" ? <MdFileDownload /> : <MdGamepad />}{" "}
                {i.name}
              </p>
            </ListItem>
          ))}
        </List>
      </div>
      <div className="flex-grow p-3 overflow-y-auto w-3/4">
        {creating ? (
          <ChangeProfileFragment
            action="create"
            onDone={() => setCreating(false)}
          />
        ) : current && manager ? (
          <TabController orientation="horizontal" contextRef={tabRef}>
            <TabBar>
              <TabBarItem value={0}>{t("general")}</TabBarItem>
              <TabBarItem value={1}>{t("edit")}</TabBarItem>
              <TabBarItem value={2}>{t("profile.maps")}</TabBarItem>
              <TabBarItem value={3}>{t("profile.resourcePacks")}</TabBarItem>
              <TabBarItem value={4}>Mods</TabBarItem>
            </TabBar>
            <TabBody>
              <ProfileGeneralFragment current={current} />
              <ChangeProfileFragment action="edit" current={current} />
              <ProfileSavesFragment manager={manager} />
              <ProfileResourcePacksFragment manager={manager} />
              <ProfileModsFragment manager={manager} />
            </TabBody>
          </TabController>
        ) : (
          <Center hFull>
            <p className="text-shallow">{t("profile.notSelected")}</p>
          </Center>
        )}
      </div>
    </div>
  );
});

export default ProfilesPage;
