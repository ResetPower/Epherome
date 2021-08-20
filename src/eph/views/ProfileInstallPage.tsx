import { useEffect, useMemo, useState } from "react";
import {
  MdArrowForward,
  MdClose,
  MdFileDownload,
  MdGamepad,
} from "react-icons/md";
import { parseJson } from "core/launch/parser";
import { createProfile, MinecraftProfile } from "common/struct/profiles";
import Fabric from "assets/Fabric.png";
import Forge from "assets/Forge.png";
import Optifine from "assets/Optifine.png";
import LiteLoader from "assets/LiteLoader.png";
import { getInstallVersions, InstallVersion } from "core/installer";
import { List, ListItem } from "../components/lists";
import Spin from "../components/Spin";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { Button, TextField } from "../components/inputs";
import { t } from "../intl";
import { useRef } from "react";

export type MinecraftInstall = "Fabric" | "Forge" | "Optifine" | "LiteLoader";

export type InstallSelection = {
  type?: MinecraftInstall;
  current?: InstallVersion;
};

export function InstallerView({
  version,
  type,
  selection,
  select,
}: {
  version: string;
  type: MinecraftInstall;
  selection: InstallSelection;
  select: (type: MinecraftInstall, current?: InstallVersion) => void;
}): JSX.Element {
  const current = selection.current;
  const [versions, setVersions] = useState<InstallVersion[] | undefined | null>(
    undefined
  );

  useEffect(() => {
    getInstallVersions(version, type)
      .then(setVersions)
      .catch(() => setVersions(null));
  }, [version, type]);

  return (
    <div className="p-9">
      <p className="text-xl font-semibold py-3">
        {t("profile.installerAdaptToSomething", version, type)}
      </p>
      <div
        className="overflow-y-auto"
        style={{ height: "calc(var(--eph-height) - 12rem)" }}
      >
        {versions ? (
          <List>
            {versions.map((val, index) => (
              <ListItem
                key={index}
                className="rounded-lg p-3"
                onClick={() => select(type, val)}
                checked={current === val}
              >
                <p>{val.name}</p>
              </ListItem>
            ))}
          </List>
        ) : versions === undefined ? (
          <Spin />
        ) : (
          <p className="text-shallow">
            {t("profile.noInstallerAdaptToSomething", version, type)}
          </p>
        )}
      </div>
      <div className="flex">
        <Button onClick={() => select(type)}>
          <MdClose /> {t("cancel")}
        </Button>
      </div>
    </div>
  );
}

export default function ProfileInstallPage({
  profile,
}: {
  profile: MinecraftProfile;
}): JSX.Element {
  const pNameEdited = useRef(false);
  const [helper, setHelper] = useState<string | null>(null);
  const [selection, setSelection] = useState<InstallSelection>({});
  const [stage, setStage] = useState<MinecraftInstall | null>(null);
  const [pName, setPName] = useState(`${profile.name} (Modified)`);
  const versionId = useMemo(() => parseJson(profile, true).id, [profile]);

  const select = (type: MinecraftInstall, current?: InstallVersion) => {
    !helper && setSelection({ type, current });
    setStage(null);
  };
  const inputPName = (str: string) => {
    !helper && setPName(str);
    !pNameEdited.current && (pNameEdited.current = true);
  };
  const handleInstall = () => {
    setHelper("Installing...");
    const iVer = selection.current;
    if (iVer) {
      const newProfile: MinecraftProfile = {
        name: pName,
        dir: profile.dir,
        ver: `${profile.ver}-${selection.type}${iVer.name}`,
        from: profile.from,
      };
      createProfile(newProfile);
      iVer?.install(newProfile).then(() => {
        setHelper(t("done"));
      });
    }
  };

  useEffect(() => {
    !pNameEdited.current &&
      setPName(
        `${profile.name} (${
          selection.type && selection.current ? selection.type : "Modified"
        })`
      );
  }, [profile.name, selection]);

  return (
    <SwitchTransition>
      <CSSTransition key={stage} timeout={150} classNames="tab-horizontal">
        {stage ? (
          <InstallerView
            type={stage}
            select={select}
            selection={selection}
            version={versionId}
          />
        ) : (
          <div className="p-9">
            <p className="text-xl font-semibold">
              {t("profile.installForMinecraft", versionId)}
            </p>
            <p className="text-shallow">{t("profile.selectInstallContent")}</p>
            <TextField
              className="py-3"
              icon={<MdGamepad />}
              label={t("download.profileName")}
              value={pName}
              onChange={inputPName}
            />
            <div className="space-y-3">
              {["Fabric", "Forge", "Optifine", "LiteLoader"].map(
                (val, index) => {
                  const i = val as MinecraftInstall;
                  const selected =
                    selection.type === i ? selection.current : undefined;
                  return (
                    <div
                      className="flex select-none cursor-pointer hover:shadow-md transition-shadow items-center p-2 shadow-sm rounded-lg bg-card"
                      onClick={() => setStage(i)}
                      key={index}
                    >
                      <img
                        className="rounded-lg w-7 h-7 mr-3"
                        src={[Fabric, Forge, Optifine, LiteLoader][index]}
                      />
                      <p className="flex-grow capitalize">{val}</p>
                      {selected && selected.name}
                      <MdArrowForward />
                    </div>
                  );
                }
              )}
            </div>
            <div className="flex py-3">
              <p className="flex-grow">{helper}</p>
              <Button
                variant="contained"
                disabled={!!helper}
                onClick={handleInstall}
              >
                <MdFileDownload /> {t("profile.install")}
              </Button>
            </div>
          </div>
        )}
      </CSSTransition>
    </SwitchTransition>
  );
}
