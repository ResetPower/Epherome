import { FormEventHandler, useRef } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { cfg } from "../../stores/config";
import { resolve } from "../../utils";
import { open } from "@tauri-apps/api/dialog";
import { t } from "../../intl";

export default function CreateInstanceFragment(props: {
  goBack: () => unknown;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    cfg.instances.add({ ...resolve(data), isFolder: false }, true);
    props.goBack();
  };

  const browse = () => {
    open({ multiple: false, directory: true }).then(
      (data) =>
        typeof data === "string" &&
        inputRef.current &&
        (inputRef.current.value = data)
    ).catch;
  };

  return (
    <form className="flex flex-col h-full py-3 pl-3 pr-6" onSubmit={onSubmit}>
      <div className="flex-grow space-y-6">
        <Input largeLabel label={t.name} name="name" required />
        <Input
          largeLabel
          label={t.instances.gameDir}
          name="gameDir"
          trailing={<Button onClick={browse}>{t.browse}</Button>}
          ref={inputRef}
          helper={t.instances.gameDirHelper}
          required
        />
        <Input
          largeLabel
          label={t.instances.version}
          name="version"
          helper={t.instances.versionHelper}
          required
        />
      </div>
      <div className="flex my-3 space-x-3 justify-end">
        <Button onClick={props.goBack}>{t.cancel}</Button>
        <Button type="submit" primary>
          {t.create}
        </Button>
      </div>
    </form>
  );
}
