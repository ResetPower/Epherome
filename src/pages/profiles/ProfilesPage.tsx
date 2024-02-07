import { useState } from "react";
import Button from "../../components/Button";
import { MdAdd } from "react-icons/md";
import ListTile from "../../components/ListTile";
import CreateProfileFragment from "./CreateProfileFragment";
import { cfg } from "../../stores/config";
import WideButton from "../../components/WideButton";
import Center from "../../components/Center";
import { confirm } from "@tauri-apps/api/dialog";

export default function ProfilesPage() {
  const [state, setState] = useState(cfg.profiles.active);
  const current = state && state !== "create" && cfg.profiles.find(state);

  return (
    <div className="flex w-full">
      <div className="w-1/4 border-r flex flex-col">
        <div className="flex-grow p-3 space-y-1">
          {cfg.profiles.isEmpty ? (
            <Center className="text-gray-500">No profiles here.</Center>
          ) : (
            cfg.profiles.map((prf, id) => (
              <ListTile
                onClick={() => {
                  cfg.profiles.selected(id);
                  setState(id);
                }}
                active={cfg.profiles.selected(id) && state !== "create"}
                key={id}
              >
                {prf.name}
              </ListTile>
            ))
          )}
        </div>
        <WideButton onClick={() => setState("create")} className="border-t">
          <MdAdd />
          Create
        </WideButton>
      </div>
      <div className="flex-grow p-3">
        {!state && (
          <Center>Open a profile on the left or create a new profile.</Center>
        )}
        {state === "create" && (
          <CreateProfileFragment goBack={() => setState(cfg.profiles.active)} />
        )}
        {current && (
          <div>
            <p>Name: {current.name}</p>
            <p>Game Directory: {current.gameDir}</p>
            <p>Version: {current.version}</p>
            <Button
              onClick={() =>
                confirm(
                  `Do you really want to remove profile ${current.name}?`
                ).then((result) => {
                  if (result) {
                    cfg.profiles.remove(state);
                    setState(undefined);
                  }
                }).catch
              }
              dangerous
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
