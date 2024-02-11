import { useEffect, useMemo, useState } from "react";
import Checkbox from "../../components/Checkbox";
import { t } from "../../intl";
import Button from "../../components/Button";
import { MinecraftUrlUtil } from "../../core/url";
import { getVersionManifest } from "../../core/install/minecraft";
import { MinecraftVersionManifest } from "../../core/versions";
import Spinner from "../../components/Spinner";
import { MdArrowForwardIos, MdBuild, MdRocket } from "react-icons/md";

export default function DownloadInstanceFragment(props: {
  goBack: () => unknown;
}) {
  const [release, setRelease] = useState(true);
  const [snapshot, setSnapshot] = useState(false);
  const [old, setOld] = useState(false);
  const [manifest, setManifest] = useState<
    MinecraftVersionManifest | undefined
  >(undefined);
  const urlUtil = useMemo(() => MinecraftUrlUtil.fromDefault(), []);

  useEffect(() => {
    getVersionManifest(urlUtil).then(setManifest).catch;
  }, [urlUtil]);

  return (
    <div className="p-3 flex flex-col h-full">
      <div className="flex space-x-3 mb-3">
        <Checkbox value={release} onChange={setRelease}>
          {t.instances.release}
        </Checkbox>
        <Checkbox value={snapshot} onChange={setSnapshot}>
          {t.instances.snapshot}
        </Checkbox>
        <Checkbox value={old} onChange={setOld}>
          {t.instances.old}
        </Checkbox>
      </div>
      <div>Downloading aren't supported yet.</div>
      {manifest && (
        <div className="flex-grow overflow-auto">
          {manifest.versions.map(
            (version) =>
              ((version.type === "release" && release) ||
                (version.type === "snapshot" && snapshot) ||
                ((version.type === "old_alpha" ||
                  version.type === "old_beta") &&
                  old)) && (
                <div
                  className="p-3 m-3 rounded cursor-pointer hover:bg-gray-200 flex items-center text-left"
                  key={version.id}
                >
                  <div className="flex-grow">
                    <div className="flex">
                      <div className="font-medium">{version.id}</div>
                      {version.id === manifest.latest.snapshot && (
                        <div className="flex text-sm items-center text-green-600">
                          <MdBuild /> {t.instances.latestSnapshot}
                        </div>
                      )}
                      {version.id === manifest.latest.release && (
                        <div className="flex text-sm items-center text-green-600">
                          <MdRocket /> {t.instances.latestRelease}
                        </div>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      {t.instances[version.type]}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(version.releaseTime).toString()}
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    <MdArrowForwardIos />
                  </div>
                </div>
              )
          )}
        </div>
      )}
      {!manifest && <Spinner />}
      <div className="flex justify-end mt-3">
        <Button onClick={props.goBack}>{t.cancel}</Button>
      </div>
    </div>
  );
}
