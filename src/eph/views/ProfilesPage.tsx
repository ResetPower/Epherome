import {
  Button,
  Checkbox,
  Link,
  Select,
  TextField,
  TinyButton,
  List,
  ListItem,
  TabBar,
  TabBarItem,
  TabBody,
  TabContext,
  TabController,
  Center,
} from "@resetpower/rcs";
import {
  createProfile,
  editProfile,
  MinecraftProfile,
} from "common/struct/profiles";
import { configStore, setConfig } from "common/struct/config";
import {
  MdCreate,
  MdExpandLess,
  MdExpandMore,
  MdFileDownload,
  MdGamepad,
} from "react-icons/md";
import { call, DefaultFn } from "common/utils";
import { useState, useRef, useCallback } from "react";
import { t } from "../intl";
import { _ } from "common/utils/arrays";
import { observer } from "mobx-react-lite";
import { FaTimes } from "react-icons/fa";
import { useEffect } from "react";
import { useMemo } from "react";
import { MinecraftProfileManagerStore } from "../../common/struct/manager";
import { defaultJvmArgs } from "common/struct/java";
import {
  ProfileGeneralFragment,
  ProfileModsFragment,
  ProfileResourcePacksFragment,
  ProfileSavesFragment,
  ProfileSettingsFragment,
} from "./ProfileManagers";
import { ipcRenderer } from "electron";
import { pushToHistory } from "eph/renderer/history";

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
  const [safeLog4j, setSafeLog4j] = useState(current?.safeLog4j ?? true);
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
        safeLog4j,
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
        safeLog4j,
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
    safeLog4j,
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
            <Link onClick={handleOpenDirectory}>
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
        <div className="h-2" />
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
            <Checkbox checked={safeLog4j} onChange={setSafeLog4j}>
              {t("profile.safeLog4j")}
            </Checkbox>
            <p className="eph-helper-text">
              {t("profile.safeLog4j.description")}
            </p>
            <div className="flex items-center space-x-3">
              <TextField
                className="flex-grow"
                label={t("profile.jvmArgs")}
                value={jvmArgs}
                onChange={setJvmArgs}
              />
              <Select
                label="Java"
                value={java}
                onChange={setJava}
                options={[
                  { value: "default", text: t("useDefault") },
                  ...configStore.javas.map((val) => ({
                    value: val.nanoid,
                    text: val.nickname ?? val.name,
                  })),
                ]}
              />
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
        <div className="py-1 px-3">
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
            onClick={() => pushToHistory("download")}
          >
            <MdFileDownload /> {t("download")}
          </Button>
        </div>
        <List className="space-y-1">
          {_.map(profiles, (i, id) => (
            <ListItem
              className="px-3 py-2 mx-2 rounded-lg overflow-x-hidden"
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
              <TabBarItem value={5}>{t("settings")}</TabBarItem>
            </TabBar>
            <TabBody>
              <ProfileGeneralFragment current={current} />
              <ChangeProfileFragment action="edit" current={current} />
              <ProfileSavesFragment manager={manager} />
              <ProfileResourcePacksFragment manager={manager} />
              <ProfileModsFragment manager={manager} />
              <ProfileSettingsFragment manager={manager} />
            </TabBody>
          </TabController>
        ) : (
          <Center>
            <p className="text-shallow">{t("profile.notSelected")}</p>
          </Center>
        )}
      </div>
    </div>
  );
});

export default ProfilesPage;
