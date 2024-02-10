import { FormEventHandler, useRef } from "react";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { cfg } from "../../stores/config";
import { resolve } from "../../utils";
import { open } from "@tauri-apps/api/dialog";
import { tr } from "../../internationalize";

export default function CreateProfileFragment(props: {
  goBack: () => unknown;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    cfg.profiles.add({ ...resolve(data), isFolder: false }, true);
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
        <Input largeLabel label="Name" name="name" required />
        <Input
          largeLabel
          label="Game Directory"
          name="gameDir"
          trailing={<Button onClick={browse}>{tr.profile.action.browse}</Button>}
          ref={inputRef}
          helper="Usually '.minecraft' on Windows or 'minecraft' on macOS and Linux."
          required
        />
        <Input
          largeLabel
          label="Version"
          name="version"
          helper="The folder name in the 'version' folder in your game directory."
          required
        />
      </div>
      <div className="flex my-3 space-x-3 justify-end">
        <Button onClick={props.goBack}>{tr.profile.action.cancel}</Button>
        <Button type="submit" primary>
          {tr.profile.action.create}
        </Button>
      </div>
    </form>
  );
}
