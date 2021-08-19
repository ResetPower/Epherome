import { ListItem } from "../components/lists";
import { t } from "../intl";
import fs from "fs";
import {
  ephLogExportsPath,
  logFilename,
  setConfig,
} from "common/struct/config";
import { Button } from "../components/inputs";
import { BiExport } from "react-icons/bi";
import { MdGamepad, MdRemoveCircle, MdStop } from "react-icons/md";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { action, makeObservable, observable, runInAction } from "mobx";
import { observer } from "mobx-react";
import { showOverlay } from "../renderer/overlays";
import { AlertDialog, ConfirmDialog } from "../components/Dialog";
import { FaLayerGroup } from "react-icons/fa";
import { GiStoneBlock } from "react-icons/gi";
import { useCallback } from "react";
import path from "path";
import { MinecraftProfile } from "common/struct/profiles";
import { ChildProcessWithoutNullStreams } from "child_process";
import { historyStore } from "../renderer/history";
import { _ } from "common/utils/arrays";
import { showItemInFinder } from "common/utils/open";

export interface Process {
  profile: MinecraftProfile;
  raw: ChildProcessWithoutNullStreams;
  outputs: string[];
  done: boolean;
}

export class ProcessStore {
  @observable
  messages = "";
  @observable
  processes: Process[] = [];
  @observable
  value = -1;
  constructor() {
    makeObservable(this);
    fs.watch(logFilename, { encoding: "utf-8" }, () => {
      const newMessages = fs.readFileSync(logFilename).toString();
      runInAction(() => (this.messages = newMessages));
    });
  }
  @action
  register(
    profile: MinecraftProfile,
    raw: ChildProcessWithoutNullStreams
  ): void {
    const proc: Process = {
      profile,
      raw,
      outputs: [],
      done: false,
    };
    const index = this.processes.length;
    this.processes[index] = proc;
    raw.on("exit", () =>
      runInAction(() => (this.processes[index].done = true))
    );
    raw.stdout.on("data", (d) =>
      runInAction(() => this.processes[index].outputs.push(d))
    );
    raw.stderr.on("data", (d) =>
      runInAction(() => this.processes[index].outputs.push(d))
    );
  }
  @action
  remove(process: Process): void {
    for (const k in this.processes) {
      if (this.processes[k] === process) {
        this.processes.splice(+k, 1);
        break;
      }
    }
  }
  @action
  select(value: number): void {
    this.value = value;
  }
}

export const processStore = new ProcessStore();

const ProcessesPage = observer(() => {
  const minecraftProcesses = processStore.processes;
  const selected = processStore.value;
  const current: Process | undefined = minecraftProcesses[selected];

  const onScrollPaneLoaded = useCallback((node: HTMLDivElement | null) => {
    node && (node.scrollTop = node.scrollHeight);
  }, []);

  const handleExport = () => {
    if (selected === -1) {
      showItemInFinder(logFilename);
    } else {
      const logFile = path.join(
        ephLogExportsPath,
        `log.${new Date().getTime()}_${selected}.log`
      );
      fs.writeFileSync(logFile, current.outputs.join("\n"));
      showItemInFinder(logFile);
      showOverlay(
        <AlertDialog
          title={t("tip")}
          message={t("processes.logExported", logFile)}
        />
      );
    }
  };
  const handleTerminate = () => {
    showOverlay(
      <ConfirmDialog
        title={t("processes.terminate")}
        message={t("processes.terminateIrreversible")}
        positiveText={t("continueAnyway")}
        positiveClassName="text-danger"
        action={() => {
          current.raw.kill();
        }}
      />
    );
  };
  const handleRemove = () => processStore.remove(current);
  const handleOpenProfile = () => {
    setConfig((cfg) => _.select(cfg.profiles, current.profile));
    historyStore.push("profiles");
  };

  return (
    <div className="flex eph-h-full overflow-hidden">
      <div className="overflow-y-auto bg-card shadow-md w-1/4">
        <div className="border-b border-divider">
          <ListItem
            checked={selected === -1}
            onClick={() => processStore.select(-1)}
            className="rounded-lg m-3 p-3 items-center overflow-x-hidden"
          >
            <p className="flex items-center">
              <FaLayerGroup className="mx-1 text-contrast" size="1em" />
              {t("epherome")}
            </p>
          </ListItem>
        </div>
        {minecraftProcesses.length === 0 ? (
          <div className="flex justify-center p-3">
            <p className="text-shallow">{t("processes.noMinecraft")}</p>
          </div>
        ) : (
          minecraftProcesses.map((value, index) => (
            <ListItem
              className="rounded-lg m-3 p-3 items-center overflow-x-hidden"
              checked={selected === index}
              onClick={() => processStore.select(index)}
              key={index}
            >
              <p
                className={`flex items-center ${
                  value.done ? "text-danger" : ""
                }`}
              >
                <GiStoneBlock className="mx-1 text-contrast" size="1em" />
                {value.profile.name}
              </p>
            </ListItem>
          ))
        )}
      </div>
      {current || selected === -1 ? (
        <div className="w-3/4 p-6">
          <SwitchTransition>
            <CSSTransition
              timeout={300}
              classNames="tab-vertical"
              key={selected}
            >
              <div
                ref={onScrollPaneLoaded}
                className="text-contrast overflow-y-auto rounded-lg bg-card shadow-md"
                style={{ height: "calc(var(--eph-height) - 3rem)" }}
              >
                <div className="px-3 flex items-center top-0 sticky shadow-sm bg-card">
                  <Button
                    className="text-blue-500 dark:text-blue-400"
                    onClick={handleExport}
                  >
                    <BiExport />{" "}
                    {selected === -1
                      ? t("processes.lookupLog")
                      : t("processes.exportLog")}
                  </Button>
                  {selected !== -1 && (
                    <Button onClick={handleOpenProfile}>
                      <MdGamepad /> {t("processes.lookupProfile")}
                    </Button>
                  )}
                  <div className="flex-grow" />
                  {selected !== -1 &&
                    (current.done ? (
                      <Button onClick={handleRemove} className="text-danger">
                        <MdRemoveCircle />
                        {t("remove")}
                      </Button>
                    ) : (
                      <Button onClick={handleTerminate} className="text-danger">
                        <MdStop />
                        {t("processes.terminate")}
                      </Button>
                    ))}
                </div>
                <div className="p-6">
                  {current
                    ? current.outputs.map((value, index) => (
                        <p key={index}>{value}</p>
                      ))
                    : processStore.messages
                        .split("\n")
                        .map((value, index) => <p key={index}>{value}</p>)}
                </div>
              </div>
            </CSSTransition>
          </SwitchTransition>
        </div>
      ) : (
        <div className="w-3/4 flex justify-center items-center">
          <p className="text-shallow">{t("processes.notSelected")}</p>
        </div>
      )}
    </div>
  );
});

export default ProcessesPage;
