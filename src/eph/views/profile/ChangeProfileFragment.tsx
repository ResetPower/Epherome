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
import SectionTitle from "eph/components/SectionTitle";
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
  const [tempProf, setTempProf] = useState<MinecraftProfile>({
    name: String(),
    dir: String(),
    ver: String(),
    jvmArgs: defaultJvmArgs(),
    resolution: {},
    java: "default",
    showEpherome: true,
    safeLog4j: true,
    gameDirIsolation: false,
    wrapperCommand: String(),
    ...current,
  });

  const setTempProfile = (a: Partial<MinecraftProfile>) =>
    setTempProf((tp) => ({ ...tp, ...a }));
  const tempProfSetters = Object.entries(tempProf)
    .map<[string, (value: unknown) => void]>(([key, superValue]) => [
      key,
      (value: typeof superValue) => setTempProfile({ [key]: value }),
    ])
    .reduce<{ [key: string]: (value: unknown) => void }>((accum, [k, v]) => {
      accum[k] = v;
      return accum;
    }, {});

  const handleCreate = () => {
    if (
      createProfile({
        ...tempProf,
        from: "create",
      })
    ) {
      call(props.onDone);
    }
  };
  const handleEdit = useCallback(() => {
    if (current && editProfile(current, tempProf)) {
      call(props.onDone);
    }
  }, [tempProf, current, props.onDone]);
  const handleResolutionChange = (type: "width" | "height", ev: string) => {
    if (ev === "") {
      setTempProfile({
        resolution: { ...tempProf.resolution, [type]: undefined },
      });
    } else {
      const num = +ev;
      num >= 0 &&
        setTempProfile({
          resolution: { ...tempProf.resolution, [type]: num },
        });
    }
  };
  const handleOpenDirectory = () =>
    ipcRenderer
      .invoke("open-directory")
      .then((value) => value && setTempProfile({ dir: value }));

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
          value={tempProf.name}
          maxLength={32}
          onChange={tempProfSetters.name}
          required
        />
        <TextField
          label={t("directory")}
          value={tempProf.dir}
          onChange={tempProfSetters.dir}
          helperText={t("profile.usuallyDotMinecraftEtc")}
          trailing={
            <Hyperlink button onClick={handleOpenDirectory}>
              {t("profile.openDirectory")}
            </Hyperlink>
          }
          required
        />
        <VersionSelector
          dir={tempProf.dir}
          value={tempProf.ver}
          onChange={tempProfSetters.ver}
        />
        <div className="h-2" />
        {more && (
          <>
            <div className="flex items-center space-x-3">
              <TextField
                className="flex-grow"
                label={t("profile.jvmArgs")}
                value={tempProf.jvmArgs}
                onChange={tempProfSetters.jvmArgs}
              />
              <Select
                label="Java"
                value={tempProf.java}
                onChange={tempProfSetters.java}
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
                value={`${tempProf.resolution?.width ?? ""}`}
                onChange={(ev) => handleResolutionChange("width", ev)}
                className="flex-grow"
                noSpinButton
              />
              <FaTimes className="text-contrast m-3" />
              <TextField
                placeholder={t("useDefault")}
                value={`${tempProf.resolution?.height ?? ""}`}
                onChange={(ev) => handleResolutionChange("height", ev)}
                className="flex-grow"
                noSpinButton
              />
            </div>
            <div className="flex">
              <Checkbox
                className="m-1"
                checked={tempProf.gameDirIsolation}
                onChange={tempProfSetters.gameDirIsolation}
              >
                {t("profile.gameDirIsolation")}
              </Checkbox>
              <div className="flex-grow" />
              <Checkbox
                className="m-1"
                checked={tempProf.showEpherome}
                onChange={tempProfSetters.showEpherome}
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
            <Checkbox
              checked={tempProf.safeLog4j}
              onChange={tempProfSetters.safeLog4j}
            >
              {t("profile.safeLog4j")}
            </Checkbox>
            <p className="eph-helper-text">
              {t("profile.safeLog4j.description")}
            </p>
            <p className="h-2"></p>
            <SectionTitle>Advanced Settings</SectionTitle>
            <TextField
              helperText="Allows launching using an extra wrapper program like 'optirun' on Linux."
              label="Wrapper Command"
              placeholder="Wrapper Command"
              value={tempProf.wrapperCommand}
              onChange={tempProfSetters.wrapperCommand}
            />
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
