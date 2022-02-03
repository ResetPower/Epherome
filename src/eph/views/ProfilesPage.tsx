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
  IconButton,
  ProgressBar,
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
  MdImportExport,
} from "react-icons/md";
import { call, DefaultFn } from "common/utils";
import { useState, useRef, useCallback, useReducer } from "react";
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
import { historyStore } from "eph/renderer/history";
import { BiImport } from "react-icons/bi";
import { importModpack } from "core/modpack";
import { taskStore } from "common/task/store";
import { Alert } from "eph/components/layouts";

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
  const [java, setJava] = useState(current?.java ? current.java : "default");
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
            <label className="rcs-label">{t("profile.resolution")}</label>
            <div className="flex items-center mb-3">
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

export function ImportModpackFragment(props: {
  onDone: DefaultFn;
}): JSX.Element {
  const theTask = useMemo(() => taskStore.findByType("importModpack"), []);
  const task = useRef(theTask);
  const [value, setValue] = useState("");
  const [, update] = useReducer((x) => x + 1, 0);

  task.current && (task.current.onSignal = update);

  const handleImport = () => {
    task.current = taskStore.register(
      "Import Modpack",
      "importModpack",
      { value },
      () => historyStore.push("profiles", "importModpack")
    );
    importModpack(value, task.current).then((profile) => {
      if (profile) {
        createProfile(profile);
        props.onDone();
      } else {
        task.current && taskStore.error(task.current.id, new Error());
      }
    });
  };
  const handleBrowse = () =>
    ipcRenderer
      .invoke("import-modpack")
      .then((value) => value && setValue(value));

  return (
    <div className="p-5 flex flex-col h-full">
      <p className="font-semibold text-xl pb-3">{t("modpack.import")}</p>
      <TextField
        value={value}
        onChange={setValue}
        placeholder={t("modpack.filePath")}
        trailing={
          <Link onClick={handleBrowse}>{t("profile.openDirectory")}</Link>
        }
      />
      {task.current?.percentage === -2 && (
        <Alert severity="error">{t("errorOccurred")}</Alert>
      )}
      <div className="flex-grow pt-3">
        {task.current?.subTasks.map(
          (detail, index) =>
            detail.inProgress && (
              <div key={index}>
                <p className="text-sm">
                  {detail.name} ({detail.percentage}%)
                </p>
                <ProgressBar percentage={detail.percentage} />
              </div>
            )
        )}
      </div>
      <div className="flex items-center">
        <p className="text-sm">{task.current?.hashMap.get("helper")}</p>
        <div className="flex-grow" />
        <Button disabled={!!task.current?.isRunning} onClick={handleImport}>
          {t("profile.import")}
        </Button>
      </div>
    </div>
  );
}

const ProfilesPage = observer((props: { params: string }) => {
  const tabRef = useRef<TabContext>();
  const [status, setStatus] = useState<false | "creating" | "importing">(
    props.params === "importModpack" ? "importing" : false
  );
  const handleCreate = () => setStatus("creating");
  const handleImport = () => setStatus("importing");
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
        <div className="flex items-center justify-center">
          <IconButton onClick={handleCreate}>
            <MdCreate />
          </IconButton>
          <IconButton onClick={() => historyStore.push("download")}>
            <MdFileDownload />
          </IconButton>
          <IconButton onClick={handleImport}>
            <BiImport />
          </IconButton>
        </div>
        <List className="space-y-1">
          {_.map(profiles, (i, id) => (
            <ListItem
              className="px-3 py-2 mx-2 rounded-lg overflow-x-hidden"
              checked={status !== "creating" && current === i}
              onClick={() => {
                status && setStatus(false);
                i.selected
                  ? setConfig(() => _.deselect(profiles))
                  : setConfig(() => _.select(profiles, i));
                tabRef.current?.setValue(0);
              }}
              key={id}
            >
              <p className="flex items-center">
                <div className="w-7">
                  {i.from === "download" ? (
                    <MdFileDownload />
                  ) : i.from === "import" ? (
                    <MdImportExport />
                  ) : (
                    <MdGamepad />
                  )}
                </div>
                {i.name}
              </p>
            </ListItem>
          ))}
        </List>
      </div>
      <div className="flex-grow p-3 overflow-y-auto w-3/4">
        {status === "creating" ? (
          <ChangeProfileFragment
            action="create"
            onDone={() => setStatus(false)}
          />
        ) : status === "importing" ? (
          <ImportModpackFragment onDone={() => setStatus(false)} />
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
