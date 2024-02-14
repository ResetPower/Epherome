import { Fragment, useEffect, useMemo, useState } from "react";
import { t } from "../../intl";
import Button from "../../components/Button";
import { MinecraftUrlUtil } from "../../core/url";
import { getVersionManifest } from "../../core/install/minecraft";
import { MinecraftVersionManifest } from "../../core/versions";
import Spinner from "../../components/Spinner";
import VersionList from "./VersionList";
import Checkbox from "../../components/Checkbox";
import VersionDetail from "./VersionDetail";

export default function DownloadInstanceFragment(props: {
  goBack: () => unknown;
  onUpdate: () => unknown;
}) {
  const [manifest, setManifest] = useState<
    MinecraftVersionManifest | undefined
  >(undefined);
  const urlUtil = useMemo(() => MinecraftUrlUtil.fromDefault(), []);
  const [id, setId] = useState<string | undefined>(undefined);
  const [release, setRelease] = useState(true);
  const [snapshot, setSnapshot] = useState(false);
  const [old, setOld] = useState(false);

  const version = id && manifest?.versions.find((x) => x.id === id);

  useEffect(() => {
    getVersionManifest(urlUtil).then(setManifest).catch;
  }, [urlUtil]);

  return (
    <div className="p-3 flex flex-col h-full">
      {version ? (
        <VersionDetail
          version={version}
          goBack={(update?: boolean) => {
            setId(undefined);
            update && props.onUpdate();
          }}
        />
      ) : (
        <Fragment>
          <div className="flex space-x-3">
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
          <div className="flex-grow overflow-auto">
            {manifest ? (
              <VersionList
                select={setId}
                manifest={manifest}
                filter={(type) =>
                  (type === "release" && release) ||
                  (type === "snapshot" && snapshot) ||
                  ((type === "old_alpha" || type === "old_beta") && old)
                }
              />
            ) : (
              <Spinner />
            )}
          </div>
        </Fragment>
      )}

      <div className="flex justify-end mt-3">
        <Button onClick={props.goBack}>{t.cancel}</Button>
      </div>
    </div>
  );
}
