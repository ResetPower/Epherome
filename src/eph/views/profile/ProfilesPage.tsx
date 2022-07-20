import {
  Button,
  Link,
  TextField,
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
import { createProfile } from "common/struct/profiles";
import { configStore, setConfig } from "common/struct/config";
import {
  MdCreate,
  MdFileDownload,
  MdGamepad,
  MdImportExport,
} from "react-icons/md";
import { DefaultFn } from "common/utils";
import { useState, useRef, useReducer } from "react";
import { t } from "../../intl";
import { _ } from "common/utils/arrays";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { MinecraftProfileManagerStore } from "../../../common/struct/manager";
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
import { ChangeProfileFragment } from "./ChangeProfileFragment";

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
    <div className="p-5 py-16 flex flex-col h-full">
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
        <Button className="text-shallow" onClick={props.onDone}>
          {t("cancel")}
        </Button>
        <Button
          className="text-secondary"
          disabled={!!task.current?.isRunning}
          onClick={handleImport}
        >
          {t("profile.import")}
        </Button>
      </div>
    </div>
  );
}

const ProfilesPage = observer((props: { params: string }) => {
  const tabRef = useRef<TabContext>();
  const [status, setStatus] = useState<
    false | "creating" | "importing" | "creatingFolder"
  >(props.params === "importModpack" ? "importing" : false);
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
              <div className="flex items-center">
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
              </div>
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
