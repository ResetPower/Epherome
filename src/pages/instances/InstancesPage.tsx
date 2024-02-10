import { useState } from "react";
import Button from "../../components/Button";
import { MdAdd } from "react-icons/md";
import ListTile from "../../components/ListTile";
import { cfg } from "../../stores/config";
import WideButton from "../../components/WideButton";
import Center from "../../components/Center";
import { confirm } from "@tauri-apps/api/dialog";
import { t } from "../../intl";
import CreateInstanceFragment from "./CreateInstanceFragment";

export default function InstancesPage() {
  const [state, setState] = useState(cfg.instances.active);
  const current = state && state !== "create" && cfg.instances.find(state);

  return (
    <div className="flex w-full">
      <div className="w-1/4 border-r flex flex-col">
        <div className="flex-grow p-3 space-y-1">
          {cfg.instances.isEmpty ? (
            <Center className="text-gray-500">{t.instances.empty}</Center>
          ) : (
            cfg.instances.map((instance, id) => (
              <ListTile
                onClick={() => {
                  cfg.instances.selected(id);
                  setState(id);
                }}
                active={cfg.instances.selected(id) && state !== "create"}
                key={id}
              >
                {instance.name}
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
        {!state && <Center>{t.instances.unopened}</Center>}
        {state === "create" && (
          <CreateInstanceFragment
            goBack={() => setState(cfg.instances.active)}
          />
        )}
        {current && (
          <div>
            <p>
              {t.name}: {current.name}
            </p>
            <p>
              {t.instances.gameDir}: {current.gameDir}
            </p>
            <p>
              {t.instances.version}: {current.version}
            </p>
            <Button
              onClick={() =>
                confirm(t.instances.removeConfirmation(current.name)).then(
                  (result) => {
                    if (result) {
                      cfg.instances.remove(state);
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
