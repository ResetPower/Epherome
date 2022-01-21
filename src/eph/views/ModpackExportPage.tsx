import { Button, Checkbox, TextField } from "@resetpower/rcs";
import { MinecraftProfile } from "common/struct/profiles";
import { exportModpack } from "core/modpack";
import { ipcRenderer } from "electron";
import path from "path";
import fs from "fs";
import { useMemo, useState } from "react";
import { adapt } from "common/utils";
import { showOverlay } from "eph/overlay";
import { t } from "eph/intl";
import { MdPersonOutline, MdTextFields, MdTimelapse } from "react-icons/md";

export default function ModpackExportPage({
  profile,
}: {
  profile: MinecraftProfile;
}): JSX.Element {
  const realGameDir = profile.gameDirIsolation
    ? path.join(profile.dir, "versions", profile.ver)
    : profile.dir;
  const noGoodList = [
    ".DS_Store",
    "versions",
    "vanilla.json",
    `${profile.ver}.jar`,
    `${profile.ver}.json`,
    `${profile.ver}-natives`,
  ];
  const files = useMemo(() => fs.readdirSync(realGameDir), [realGameDir]);
  const [antiValues, setAntiValues] = useState<string[]>([]);
  const [stat, setStat] = useState(false);
  const [stage, setStage] = useState(0);
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [ver, setVer] = useState("");

  const changeValue = (c: boolean, v: string) => {
    if (c) {
      setAntiValues(antiValues.filter((w) => w !== v));
    } else {
      setAntiValues([...antiValues, v]);
    }
  };
  const handleExport = () =>
    ipcRenderer.invoke("export-modpack").then((value) => {
      if (value) {
        setStat(true);
        exportModpack(
          profile,
          realGameDir,
          value,
          [...noGoodList, ...antiValues],
          [name, ver, author]
        ).then(() =>
          showOverlay({ message: t("done"), action: () => history.back() })
        );
      }
    });

  return (
    <div className="p-9 flex flex-col eph-h-full">
      <div className="flex-grow">
        {stage === 0 ? (
          <div className="space-y-1">
            <p className="font-semibold text-xl mb-3">Modpack Info</p>
            <TextField
              value={name}
              onChange={setName}
              icon={<MdTextFields />}
              placeholder="Modpack Name"
            />
            <TextField
              value={ver}
              onChange={setVer}
              icon={<MdTimelapse />}
              placeholder="Modpack Version"
            />
            <TextField
              value={author}
              onChange={setAuthor}
              icon={<MdPersonOutline />}
              placeholder="Modpack Author"
            />
          </div>
        ) : (
          <div>
            <p className="font-semibold text-xl mb-3">Select Files...</p>
            <div className="overflow-auto">
              {files.map(
                (value, index) =>
                  !adapt(value, ...noGoodList) && (
                    <div className="flex" key={index}>
                      <Checkbox
                        checked={antiValues.indexOf(value) === -1}
                        onChange={(c) => changeValue(c, value)}
                      >
                        {value}
                      </Checkbox>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center">
        {stage === 1 &&
          (stat ? (
            <p className="text-sm">Exporting...</p>
          ) : (
            <Button onClick={() => setStage(0)}>Previous</Button>
          ))}
        <div className="flex-grow" />
        {stage === 0 ? (
          <Button onClick={() => !!name && !!author && !!ver && setStage(1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleExport} disabled={stat}>
            EXPORT!
          </Button>
        )}
      </div>
    </div>
  );
}