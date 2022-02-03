import { observer } from "mobx-react-lite";
import { BiExport, BiImport } from "react-icons/bi";
import { IoMdCheckmarkCircle, IoMdCloseCircle } from "react-icons/io";
import {
  MdClose,
  MdDelete,
  MdFolderOpen,
  MdRefresh,
  MdSave,
} from "react-icons/md";
import {
  Button,
  Link,
  TextField,
  TinyTextField,
  Info,
  ListItem,
  ListItemText,
} from "@resetpower/rcs";
import { MinecraftProfileManagerStore } from "common/struct/manager";
import { t } from "../intl";
import { openInFinder, openItemInFinder } from "common/utils/open";
import { showOverlay } from "../overlay";
import { MinecraftProfile, removeProfile } from "common/struct/profiles";
import { VscPackage } from "react-icons/vsc";
import { parseJson } from "core/launch/parser";
import { useEffect, useMemo, useState } from "react";
import { historyStore } from "eph/renderer/history";
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
      action: (r) => {
        if (r) {
          moveToTrash(path.join(current.dir, "versions", current.ver));
        }
        removeProfile(current);
      },
      check: true,
      checkText: t("removeFilesAsWell"),
      positiveText: t("remove"),
      dangerous: true,
      cancellable: true,
    });
  const handleExport = () =>
    historyStore.push(
      "profile.exportModpack",
      `${configStore.profiles.indexOf(current)}`
    );
  const handleGoToInstall = () => {
    if (current.modpackInfo) {
      showOverlay({ message: "Don't install on a modpack." });
    } else if (parsed.inheritsFrom) {
      showOverlay({ message: t("profile.canOnlyInstallOnVanilla") });
    } else {
      historyStore.push(
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
          <Link
            onClick={() => {
              openInFinder(current.dir);
            }}
          >
            {current.dir}
          </Link>
        </Info>
        <Info title={t("version")}>
          {current.realVer ? (
            <>
              {current.realVer} ({current.ver})
            </>
          ) : (
            current.ver
          )}
        </Info>
        {current.modpackInfo && (
          <div>
            <Info title={t("modpack.name")}>{current.modpackInfo.name}</Info>
            <Info title={t("modpack.version")}>
              {current.modpackInfo.version}
            </Info>
            <Info title={t("modpack.author")}>
              {current.modpackInfo.author}
            </Info>
          </div>
        )}
      </div>
      <div className="flex">
        <Button variant="contained" onClick={handleGoToInstall}>
          <VscPackage /> {t("profile.install")}
        </Button>
        <Button onClick={handleExport}>
          <BiExport /> {t("profile.exportModpack")}
        </Button>
        <div className="flex-grow" />
        <Button className="text-danger" onClick={handleRemove}>
          <MdDelete />
          {t("remove")}
        </Button>
      </div>
      <div className="flex">
        <div className="flex-grow" />
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
            <ListItemText
              primary={i.name}
              secondary={t(`profile.resourceType.${i.type}`)}
              expand
            />
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
          {t("profile.gameOptionsPath")}:{" "}
          <Link onClick={() => openItemInFinder(manager.optionsTxtPath)}>
            {manager.optionsTxtPath}
          </Link>
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
            placeholder={`${t("search")}...`}
          />
        </div>
        <div className="space-y-3 mt-3">
          {manager.options
            ? manager.options.map(
                (value, index) =>
                  value.key.toLowerCase().includes(query.toLowerCase()) && (
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
