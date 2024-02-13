import { useState } from "react";
import { MdAdd, MdDownload } from "react-icons/md";
import ListTile from "../../components/ListTile";
import { cfg } from "../../stores/config";
import WideButton from "../../components/WideButton";
import Center from "../../components/Center";
import { confirm } from "@tauri-apps/api/dialog";
import { t } from "../../intl";
import CreateInstanceFragment from "./CreateInstanceFragment";
import DownloadInstanceFragment from "./DownloadInstanceFragment";
import InstanceDetailFragment from "./InstanceDetailFragment";

export default function InstancesPage() {
  const [state, setState] = useState(cfg.instances.active);
  const current =
    state &&
    state !== "create" &&
    state !== "download" &&
    cfg.instances.find(state);

  const goBack = () => setState(cfg.instances.active);

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
                  cfg.instances.select(id);
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
        <WideButton onClick={() => setState("download")} className="border-t">
          <MdDownload />
          {t.download}
        </WideButton>
        <WideButton onClick={() => setState("create")} className="border-t">
          <MdAdd />
          {t.create}
        </WideButton>
      </div>
      <div className="flex-grow p-3">
        {!state && <Center>{t.instances.unopened}</Center>}
        {state === "create" && <CreateInstanceFragment goBack={goBack} />}
        {state === "download" && <DownloadInstanceFragment goBack={goBack} />}
        {current && (
          <InstanceDetailFragment
            onRemove={() =>
              confirm(t.instances.removeConfirmation(current.name)).then(
                (result) => {
                  if (result) {
                    cfg.instances.remove(state);
                    setState(undefined);
                  }
                }
              )
            }
            current={current}
          />
        )}
      </div>
    </div>
  );
}
