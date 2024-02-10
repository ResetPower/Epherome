import { useState } from "react";
import Button from "../../components/Button";
import { MdAdd } from "react-icons/md";
import ListTile from "../../components/ListTile";
import CreateProfileFragment from "./CreateProfileFragment";
import { cfg } from "../../stores/config";
import WideButton from "../../components/WideButton";
import Center from "../../components/Center";
import { confirm } from "@tauri-apps/api/dialog";
import { t } from "../../intl";

export default function ProfilesPage() {
  const [state, setState] = useState(cfg.profiles.active);
  const current = state && state !== "create" && cfg.profiles.find(state);

  return (
    <div className="flex w-full">
      <div className="w-1/4 border-r flex flex-col">
        <div className="flex-grow p-3 space-y-1">
          {cfg.profiles.isEmpty ? (
            <Center className="text-gray-500">{t.profiles.empty}</Center>
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
          {t.create}
        </WideButton>
      </div>
      <div className="flex-grow p-3">
        {!state && <Center>{t.profiles.unopened}</Center>}
        {state === "create" && (
          <CreateProfileFragment goBack={() => setState(cfg.profiles.active)} />
        )}
        {current && (
          <div>
            <p>
              {t.name}: {current.name}
            </p>
            <p>
              {t.profiles.gameDir}: {current.gameDir}
            </p>
            <p>
              {t.profiles.version}: {current.version}
            </p>
            <Button
              onClick={() =>
                confirm(t.profiles.removeConfirmation(current.name)).then(
                  (result) => {
                    if (result) {
                      cfg.profiles.remove(state);
                      setState(undefined);
                    }
                  }
                ).catch
              }
              dangerous
            >
              {t.remove}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
