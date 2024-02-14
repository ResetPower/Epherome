import { MdArrowForwardIos, MdBuild, MdRocket } from "react-icons/md";
import {
  MinecraftVersionManifest,
  MinecraftVersionType,
} from "../../core/versions";
import { t } from "../../intl";
import Shallow from "../../components/Shallow";

export default function VersionList(props: {
  select: (id: string) => unknown;
  manifest: MinecraftVersionManifest;
  filter: (type: MinecraftVersionType) => boolean;
}) {
  return props.manifest.versions.map(
    (version) =>
      props.filter(version.type) && (
        <div
          className="p-3 m-3 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center text-left"
          key={version.id}
          onClick={() => props.select(version.id)}
        >
          <div className="flex-grow">
            <div className="flex">
              <div className="font-medium">{version.id}</div>
              {version.id === props.manifest.latest.snapshot && (
                <div className="flex text-sm items-center text-green-600">
                  <MdBuild /> {t.instances.latestSnapshot}
                </div>
              )}
              {version.id === props.manifest.latest.release && (
                <div className="flex text-sm items-center text-green-600">
                  <MdRocket /> {t.instances.latestRelease}
                </div>
              )}
            </div>
            <Shallow className=" text-sm font-medium">
              {t.instances[version.type]}
            </Shallow>
            <Shallow className="text-xs">
              {new Date(version.releaseTime).toString()}
            </Shallow>
          </div>
          <Shallow className="text-sm">
            <MdArrowForwardIos />
          </Shallow>
        </div>
      )
  );
}
