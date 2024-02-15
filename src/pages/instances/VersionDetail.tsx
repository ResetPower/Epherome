import { MdArrowBack } from "react-icons/md";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { t } from "../../intl";
import { useRef, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { MinecraftVersion } from "../../core/versions";
import { installMinecraft } from "../../core/install/minecraft";
import { toastStore } from "../../stores/toast";
import { cfg } from "../../stores/config";
import Shallow from "../../components/Shallow";

export default function VersionDetail(props: {
  version: MinecraftVersion;
  goBack: (update?: boolean) => unknown;
}) {
  const [helper, setHelper] = useState(String());
  const inputRef = useRef<HTMLInputElement>(null);
  const browse = () =>
    open({ multiple: false, directory: true }).then(
      (data) =>
        typeof data === "string" &&
        inputRef.current &&
        (inputRef.current.value = data)
    ).catch;
  const install = () => {
    const dest = inputRef.current?.value;
    if (dest) {
      installMinecraft(dest, props.version, () =>
        setHelper(t.downloading.clientJar)
      )
        .then(() => {
          toastStore.success(t.downloading.minecraft.success(props.version.id));
          cfg.instances.add(
            {
              name: `Minecraft ${props.version.id}`,
              gameDir: dest,
              version: props.version.id,
              isFolder: false,
            },
            true
          );
          props.goBack(true);
        })
        .catch(() => {
          toastStore.fail(t.downloading.minecraft.failed(props.version.id));
          setHelper(String());
        });
      setHelper(t.downloading.clientJson);
    }
  };

  return (
    <div className="h-full">
      <Button onClick={() => props.goBack()}>
        <MdArrowBack />
        {t.instances.backToVersionList}
      </Button>
      <div className="p-3">{t.installs.minecraft(props.version.id)}</div>
      <Input
        ref={inputRef}
        label={t.instances.gameDir}
        helper={t.instances.gameDirHelper}
      />
      <div className="flex space-x-3 justify-end">
        <Button onClick={browse}>{t.browse}</Button>
        <Button disabled={!!helper} onClick={install} primary>
          {t.install}
        </Button>
      </div>
      <Shallow className="text-sm font-medium">{helper}</Shallow>
    </div>
  );
}
