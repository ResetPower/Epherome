import { useEffect, useMemo, useState } from "react";
import { MdArrowForward, MdClose, MdFileDownload } from "react-icons/md";
import { parseJson } from "core/launch/parser";
import { MinecraftProfile } from "common/struct/profiles";
import Fabric from "assets/Fabric.png";
import Forge from "assets/Forge.png";
import Optifine from "assets/Optifine.png";
import LiteLoader from "assets/LiteLoader.png";
import { getInstallVersions, InstallVersion } from "core/installer";
import { List, ListItem } from "../components/lists";
import Spin from "../components/Spin";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { DefaultFn } from "common/utils";
import { Button } from "../components/inputs";
import { t } from "../intl";
import { showOverlay } from "../renderer/overlays";
import { NotSupportedDialog } from "../components/Dialog";

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
  back,
}: {
  version: string;
  type: MinecraftInstall;
  selection: InstallSelection;
  select: (type: MinecraftInstall, current?: InstallVersion) => void;
  back: DefaultFn;
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
        适用于 Minecraft {version} 的 {type}
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
                onClick={() => {
                  select(type, val);
                  back();
                }}
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
            没有适用于 {version} 的 {type}
          </p>
        )}
      </div>
      <div className="flex">
        <Button
          onClick={() => {
            select(type);
            back();
          }}
        >
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
  const [selection, setSelection] = useState<InstallSelection>({});
  const [stage, setStage] = useState<MinecraftInstall | null>(null);
  const versionId = useMemo(() => parseJson(profile, true).id, [profile]);

  const handleInstall = () => {
    showOverlay(<NotSupportedDialog />);
  };

  return (
    <SwitchTransition>
      <CSSTransition key={stage} timeout={150} classNames="tab-horizontal">
        {stage ? (
          <InstallerView
            type={stage}
            select={(type, current) => setSelection({ type, current })}
            selection={selection}
            version={versionId}
            back={() => setStage(null)}
          />
        ) : (
          <div className="p-9">
            <p className="text-xl font-semibold">
              为 Minecraft {versionId} 安装
            </p>
            <p className="text-shallow">选择一个你想要安装的内容。</p>
            <div className="space-y-3 pt-9">
              {["Fabric", "Forge", "Optifine", "LiteLoader"].map(
                (val, index) => {
                  const i = val as MinecraftInstall;
                  const selected =
                    selection.type === i ? selection.current : undefined;
                  return (
                    <div
                      className="flex select-none cursor-pointer hover:shadow-md transition-shadow items-center p-3 shadow-sm rounded-lg bg-card"
                      onClick={() => setStage(i)}
                      key={index}
                    >
                      <img
                        className="rounded-lg w-9 h-9 mr-3"
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
            <div className="flex py-3 justify-end">
              <Button variant="contained" onClick={handleInstall}>
                <MdFileDownload /> {t("profile.install")}
              </Button>
            </div>
          </div>
        )}
      </CSSTransition>
    </SwitchTransition>
  );
}
