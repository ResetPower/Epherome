import { observer } from "mobx-react-lite";
import { BiImport } from "react-icons/bi";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import {
  MdClose,
  MdDelete,
  MdFolderOpen,
  MdRefresh,
  MdSave,
} from "react-icons/md";
import { Info } from "../components/fragments";
import { Button, Link, TextField, TinyTextField } from "../components/inputs";
import { ListItem, ListItemText } from "../components/lists";
import { MinecraftProfileManagerStore } from "common/struct/manager";
import { t } from "../intl";
import { openInFinder } from "common/utils/open";
import { showOverlay } from "../overlay";
import { MinecraftProfile, removeProfile } from "common/struct/profiles";
import { VscPackage } from "react-icons/vsc";
import { parseJson } from "core/launch/parser";
import { useEffect, useMemo, useState } from "react";
import { pushToHistory } from "eph/renderer/history";
import { moveToTrash } from "common/utils/files";
import path from "path";
import { _ } from "common/utils/arrays";
import { configStore } from "common/struct/config";

export function Highlight({
  keyword,
  children,
  className,
}: {
  keyword: string;
  children: string;
  className?: string;
}) {
  const i = children.indexOf(keyword);
  const [before, after] = [
    children.slice(0, i),
    children.slice(i + keyword.length),
  ];
  return (
    <div className={className}>
      <span>{before}</span>
      <span className="text-danger">{keyword}</span>
      <span>{after}</span>
    </div>
  );
}

export function showMoveToTrashAlert(filepath: string): Promise<void> {
  return new Promise((resolve) => {
    const filename = path.basename(filepath);

    showOverlay({
      title: t("moveToTrash"),
      message: t("confirmMoveSomethingToTrash", filename),
      action: () => {
        moveToTrash(filepath).then(resolve);
      },
      dangerous: true,
      cancellable: true,
    });
  });
}

export function ProfileGeneralFragment({
  current,
}: {
  current: MinecraftProfile;
}): JSX.Element {
  const parsed = useMemo(() => {
    try {
      return parseJson(current, true);
    } catch {
      return { inheritsFrom: true };
    }
  }, [current]);
  const handleRemove = () =>
    showOverlay({
      title: t("profile.removing"),
      message: t("confirmRemoving"),
      action: () => removeProfile(current),
      positiveText: t("remove"),
      dangerous: true,
      cancellable: true,
    });
  const handleGoToInstall = () => {
    if (parsed.inheritsFrom) {
      showOverlay({ message: t("profile.canOnlyInstallOnVanilla") });
    } else {
      pushToHistory(
        "profile.install",
        `${_.index(configStore.profiles, current)}`
      );
    }
  };

  return (
    <div>
      <div className="flex-grow space-y-1 pb-3">
        <Info title={t("name")}>{current.name}</Info>
        <Info title={t("directory")}>
          <Link type="file" href={current.dir}>
            {current.dir}
          </Link>
        </Info>
        <Info title={t("version")}>{current.ver}</Info>
      </div>
      <div className="flex">
        <Button variant="contained" onClick={handleGoToInstall}>
          <VscPackage /> {t("profile.install")}
        </Button>
        <div className="flex-grow" />
        <Button className="text-danger" onClick={handleRemove}>
          <MdDelete />
          {t("remove")}
        </Button>
      </div>
    </div>
  );
}

export const ProfileSavesFragment = observer(
  ({ manager }: { manager: MinecraftProfileManagerStore }): JSX.Element => (
    <div>
      <div className="flex">
        <Button onClick={manager.refresh}>
          <MdRefresh />
          {t("refresh")}
        </Button>
        <div className="flex-grow" />
        <Button onClick={() => openInFinder(manager.savesPath)}>
          <MdFolderOpen />
          {t("profile.openDirectory")}
        </Button>
      </div>
      {manager.saves.length === 0 ? (
        <div className="flex text-shallow justify-center">
          {t("profile.noContent")}
        </div>
      ) : (
        manager.saves.map((i) => (
          <ListItem
            className="rounded-lg m-2 p-3 text-contrast"
            checked={manager.selections.save === i.id}
            onClick={() => manager.select("save", i.id)}
            key={i.id}
          >
            <p>{i.name}</p>
            <div className="flex-grow" />
            <MdClose
              onClick={() => showMoveToTrashAlert(i.path).then(manager.refresh)}
            />
          </ListItem>
        ))
      )}
    </div>
  )
);

export const ProfileResourcePacksFragment = observer(
  ({ manager }: { manager: MinecraftProfileManagerStore }): JSX.Element => (
    <div>
      <div className="flex">
        <Button onClick={manager.refresh}>
          <MdRefresh />
          {t("refresh")}
        </Button>
        <div className="flex-grow" />
        <Button onClick={() => openInFinder(manager.resourcePacksPath)}>
          <MdFolderOpen />
          {t("profile.openDirectory")}
        </Button>
      </div>
      {manager.resourcePacks.length === 0 ? (
        <div className="flex text-shallow items-center justify-center">
          {t("profile.noContent")}
        </div>
      ) : (
        manager.resourcePacks.map((i) => (
          <ListItem
            className="rounded-lg m-2 p-3 text-contrast"
            checked={manager.selections.resourcePack === i.id}
            onClick={() => manager.select("resourcePack", i.id)}
            key={i.id}
          >
            <ListItemText primary={i.name} secondary={i.type} expand />
            <MdClose
              onClick={() => showMoveToTrashAlert(i.path).then(manager.refresh)}
            />
          </ListItem>
        ))
      )}
    </div>
  )
);

export const ProfileModsFragment = observer(
  ({ manager }: { manager: MinecraftProfileManagerStore }) => (
    <div>
      <div className="flex">
        <Button onClick={manager.refresh}>
          <MdRefresh />
          {t("refresh")}
        </Button>
        <Button onClick={manager.importMod}>
          <BiImport />
          {t("profile.import")}
        </Button>
        <div className="flex-grow" />
        <Button onClick={() => manager.enableMod(manager.selections.mod)}>
          <IoMdCheckmarkCircle />
          {t("profile.enable")}
        </Button>
        <Button onClick={() => manager.disableMod(manager.selections.mod)}>
          <IoMdCloseCircle />
          {t("profile.disable")}
        </Button>
        <Button onClick={() => openInFinder(manager.modsPath)}>
          <MdFolderOpen />
          {t("profile.openDirectory")}
        </Button>
      </div>
      {manager.mods.length === 0 ? (
        <div className="flex text-shallow items-center justify-center">
          {t("profile.noContent")}
        </div>
      ) : (
        manager.mods.map((i) => (
          <ListItem
            className="rounded-lg m-2 p-3 text-contrast"
            checked={manager.selections.mod === i.id}
            onClick={() => manager.select("mod", i.id)}
            key={i.id}
          >
            <p className={i.enabled ? "" : "text-shallow"}>{i.name}</p>
            <div className="flex-grow" />
            <MdClose
              onClick={() => showMoveToTrashAlert(i.path).then(manager.refresh)}
            />
          </ListItem>
        ))
      )}
    </div>
  )
);

export const ProfileSettingsFragment = observer(
  ({ manager }: { manager: MinecraftProfileManagerStore }) => {
    const [query, setQuery] = useState("");
    const [editions, setEditions] = useState<
      Record<string, string | undefined>
    >({});

    const edit = (key: string, value: string) => {
      if (manager.options?.find((v) => v.key === key)?.value === value) {
        setEditions({ ...editions, [key]: undefined });
      } else {
        setEditions({ ...editions, [key]: value });
      }
    };

    useEffect(() => {
      if (manager.options === null) {
        manager.readOptions();
      }
    });

    return (
      <div className="text-sm">
        <p>
          Minecraft Options Path:{" "}
          <Link href={manager.optionsTxtPath} type="file" />
        </p>
        <div className="flex">
          <Button
            variant="contained"
            onClick={() => {
              manager.saveOptions(editions);
              setEditions({});
            }}
          >
            <MdSave /> {t("save")}
          </Button>
          <div className="flex-grow" />
          <TextField
            value={query}
            onChange={setQuery}
            placeholder="Search..."
          />
        </div>
        <div className="space-y-3 mt-3">
          {manager.options
            ? manager.options.map(
                (value, index) =>
                  value.key.includes(query) && (
                    <div key={index} className="flex">
                      <Highlight
                        keyword={query}
                        className={`flex-grow ${
                          editions[value.key] && "italic"
                        }`}
                      >
                        {value.key}
                      </Highlight>
                      <TinyTextField
                        value={editions[value.key] ?? value.value}
                        onChange={(v) => edit(value.key, v)}
                      />
                    </div>
                  )
              )
            : "..."}
        </div>
      </div>
    );
  }
);
