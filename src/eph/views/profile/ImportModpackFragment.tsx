import { Button, Hyperlink, ProgressBar, TextField } from "@resetpower/rcs";
import { createProfile } from "common/struct/profiles";
import { taskStore } from "common/task/store";
import { DefaultFn } from "common/utils";
import { importModpack } from "core/modpack";
import { ipcRenderer } from "electron";
import { Alert } from "eph/components/layouts";
import { t } from "eph/intl";
import { historyStore } from "eph/renderer/history";
import { useMemo, useReducer, useRef, useState } from "react";

export function ImportModpackFragment(props: {
  onDone: DefaultFn;
}): JSX.Element {
  const theTask = useMemo(() => taskStore.findByType("importModpack"), []);
  const task = useRef(theTask);
  const [value, setValue] = useState("");
  const [, update] = useReducer((x) => x + 1, 0);

  task.current && (task.current.onSignal = update);

  const handleImport = () => {
    task.current = taskStore.register(
      "Import Modpack",
      "importModpack",
      { value },
      () => historyStore.push("profiles", "importModpack")
    );
    importModpack(value, task.current).then((profile) => {
      if (profile) {
        createProfile(profile);
        props.onDone();
      } else {
        task.current && taskStore.error(task.current.id, new Error());
      }
    });
  };
  const handleBrowse = () =>
    ipcRenderer
      .invoke("import-modpack")
      .then((value) => value && setValue(value));

  return (
    <div className="p-5 py-16 flex flex-col h-full">
      <p className="font-medium text-xl pb-3">{t("modpack.import")}</p>
      <TextField
        value={value}
        onChange={setValue}
        placeholder={t("modpack.filePath")}
        trailing={
          <Hyperlink button onClick={handleBrowse}>
            {t("profile.openDirectory")}
          </Hyperlink>
        }
      />
      {task.current?.percentage === -2 && (
        <Alert severity="error">{t("errorOccurred")}</Alert>
      )}
      <div className="flex-grow pt-3">
        {task.current?.subTasks.map(
          (detail, index) =>
            detail.inProgress && (
              <div key={index}>
                <p className="text-sm">
                  {detail.name} ({detail.percentage}%)
                </p>
                <ProgressBar percentage={detail.percentage} />
              </div>
            )
        )}
      </div>
      <div className="flex items-center">
        <p className="text-sm">{task.current?.hashMap.get("helper")}</p>
        <div className="flex-grow" />
        <Button className="text-shallow" onClick={props.onDone}>
          {t("cancel")}
        </Button>
        <Button
          className="text-secondary"
          disabled={!!task.current?.isRunning}
          onClick={handleImport}
        >
          {t("profile.import")}
        </Button>
      </div>
    </div>
  );
}
