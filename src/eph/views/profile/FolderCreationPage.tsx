import { Button, Hyperlink, TextField } from "@resetpower/rcs";
import { ipcRenderer } from "electron";
import { t } from "eph/intl";
import { useState } from "react";
import fs from "fs";
import path from "path";
import { setConfig } from "common/struct/config";
import { showOverlay } from "eph/overlay";
import { historyStore } from "eph/renderer/history";

export default function FolderCreationPage(): JSX.Element {
  const [nickname, setNickname] = useState(String());
  const [pathname, setPathname] = useState(String());

  const onBrowse = () =>
    ipcRenderer.invoke("open-directory").then((dir) => dir && setPathname(dir));

  const onCreate = () => {
    if (nickname && pathname) {
      if (
        fs.existsSync(pathname) &&
        fs.statSync(pathname).isDirectory() &&
        fs.existsSync(path.join(pathname, "versions"))
      ) {
        setConfig((cfg) =>
          cfg.profileFolders.push({
            nickname,
            pathname,
            children: {},
          })
        );
        historyStore.back();
      } else {
        showOverlay({
          type: "dialog",
          title: "Warning",
          message:
            "A legal game folder must contain a version folder. (/path/to/your/folder/versions)",
        });
      }
    }
  };

  return (
    <div className="px-6 py-4 space-y-6">
      <div className="mt-3">
        Add a game folder will make it a individual unit in Epherome profiles.
        <br />
        You can install game to it, and launch all the versions in the folder.
      </div>
      <TextField
        label="Nickname"
        placeholder="Nickname"
        value={nickname}
        required
        onChange={setNickname}
      />
      <TextField
        label="Folder Path"
        placeholder="Folder Path"
        value={pathname}
        helperText={t("profile.usuallyDotMinecraftEtc")}
        required
        onChange={setPathname}
        trailing={
          <Hyperlink onClick={onBrowse} button>
            Browse
          </Hyperlink>
        }
      />
      <div className="flex justify-end">
        <Button className="text-shallow" onClick={() => historyStore.back()}>
          Cancel
        </Button>
        <Button className="text-primary" onClick={onCreate}>
          Create
        </Button>
      </div>
    </div>
  );
}
