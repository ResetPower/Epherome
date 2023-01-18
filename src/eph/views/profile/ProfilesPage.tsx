import {
  ListItem,
  TabBar,
  TabBarItem,
  TabBody,
  TabController,
  Center,
  IconButton,
} from "@resetpower/rcs";
import type { TabContext } from "@resetpower/rcs";
import { configStore, setConfig } from "common/struct/config";
import {
  MdCreate,
  MdCreateNewFolder,
  MdFileDownload,
  MdGamepad,
  MdImportExport,
} from "react-icons/md";
import { useState, useRef } from "react";
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
import { historyStore } from "eph/renderer/history";
import { BiImport } from "react-icons/bi";
import { ChangeProfileFragment } from "./ChangeProfileFragment";
import ExpansionPanel from "eph/components/ExpansionPanel";
import path from "path";
import fs from "fs";
import { ImportModpackFragment } from "./ImportModpackFragment";

const ProfilesPage = observer((props: { params: string }) => {
  const tabRef = useRef<TabContext>();
  const [status, setStatus] = useState<
    false | "creating" | "importing" | "creatingFolder"
  >(props.params === "importModpack" ? "importing" : false);
  const handleCreate = () => setStatus("creating");
  const handleImport = () => setStatus("importing");
  const profiles = configStore.profiles;
  const folders = configStore.profileFolders;
  const current = configStore.currentProfile;
  const _key = current?.gameDirIsolation;
  const manager = useMemo(() => {
    _key;
    return current ? new MinecraftProfileManagerStore(current) : undefined;
  }, [_key, current]);
  const [open, setOpen] = useState(current?.from !== "folder");
  const [openArgs, setOpenArgs] = useState<{ [key: number]: boolean }>({});

  // automatically open the expandable panel that the selected profile is in
  const openIndex = current?.parent && _.index(folders, current?.parent);
  if (openIndex !== undefined) openArgs[openIndex] = true;

  return (
    <div className="flex eph-h-full">
      <div className="bg-card z-10 shadow-md py-1 w-1/4 flex flex-col">
        <div className="overflow-y-auto flex-grow">
          <ExpansionPanel
            label="Standalone Profiles"
            length={profiles.length}
            open={open}
            onToggle={() => setOpen((v) => !v)}
          >
            {_.map(profiles, (i, id) => (
              <ListItem
                className="px-3 py-2 overflow-x-hidden"
                active={status !== "creating" && current === i}
                onClick={() => {
                  status && setStatus(false);
                  i.selected
                    ? setConfig(() => _.deselect(profiles))
                    : setConfig(() => {
                        _.select(profiles, i);
                        // deselect other game folders' profiles in avoiding of conflict
                        _.deselect(folders);
                      });
                  tabRef.current?.setValue(0);
                }}
                key={id}
                dependent
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
          </ExpansionPanel>
          {folders.map((folder) => {
            const index = _.index(configStore.profileFolders, folder);
            const versions = fs.readdirSync(
              path.join(folder.pathname, "versions")
            );
            if (index === undefined) return false;
            return (
              <ExpansionPanel
                label={folder.nickname}
                open={openArgs[index] ?? false}
                onToggle={() =>
                  setOpenArgs({
                    ...openArgs,
                    [index]: !(openArgs[index] ?? false),
                  })
                }
                length={versions.length}
                key={index}
              >
                {versions ? (
                  versions.map((i, id) => (
                    <ListItem
                      active={
                        current?.from === "folder" && current.parent === folder
                      }
                      onClick={() =>
                        setConfig((cfg) => {
                          _.select(cfg.profileFolders, folder);
                          folder.selectedChild = i;
                        })
                      }
                      key={id}
                      dependent
                    >
                      {i}
                    </ListItem>
                  ))
                ) : (
                  <div className="text-shallow">
                    No versions in this folder.
                  </div>
                )}
              </ExpansionPanel>
            );
          })}
        </div>
        <div className="flex justify-center space-x-3 border-t border-divider items-center">
          <IconButton onClick={handleCreate}>
            <MdCreate />
          </IconButton>
          <IconButton onClick={() => historyStore.push("folders")}>
            <MdCreateNewFolder />
          </IconButton>
          <IconButton onClick={() => historyStore.push("download")}>
            <MdFileDownload />
          </IconButton>
          <IconButton onClick={handleImport}>
            <BiImport />
          </IconButton>
        </div>
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
