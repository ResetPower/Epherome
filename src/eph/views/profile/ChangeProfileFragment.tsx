import {
  BadgeButton,
  Button,
  Checkbox,
  Hyperlink,
  Select,
  TextField,
} from "@resetpower/rcs";
import { configStore } from "common/struct/config";
import {
  createProfile,
  editProfile,
  MinecraftProfile,
} from "common/struct/profiles";
import { call, DefaultFn } from "common/utils";
import { defaultJvmArgs } from "core/java";
import { ipcRenderer } from "electron";
import { t } from "eph/intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { MdExpandLess, MdExpandMore } from "react-icons/md";
import VersionSelector from "./VersionSelector";

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
            <Hyperlink button onClick={handleOpenDirectory}>
              {t("profile.openDirectory")}
            </Hyperlink>
          }
          required
        />
        <VersionSelector dir={dir} value={ver} onChange={setVer} />
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
            <p className="h-2"></p>
          </>
        )}
        <div className="flex">
          <BadgeButton onClick={() => setMore((prev) => !prev)}>
            {more ? <MdExpandLess /> : <MdExpandMore />}
            {more ? t("collapse") : t("expand")}
          </BadgeButton>
        </div>
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
