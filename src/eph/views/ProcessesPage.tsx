import { ListItem, Button } from "@resetpower/rcs";
import { t } from "../intl";
import { setConfig } from "common/struct/config";
import { BiExport } from "react-icons/bi";
import { MdGamepad, MdRemoveCircle, MdStop } from "react-icons/md";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { observer } from "mobx-react-lite";
import { showOverlay } from "../overlay";
import { FaLayerGroup } from "react-icons/fa";
import { GiStoneBlock } from "react-icons/gi";
import { useCallback } from "react";
import path from "path";
import fs from "fs";
import { _ } from "common/utils/arrays";
import { Process, processStore } from "../../common/stores/process";
import { ephLatestLog, ephLogs } from "common/utils/info";
import { openItemInFinder } from "common/utils/open";
import { historyStore } from "eph/renderer/history";

const ProcessesPage = observer(() => {
  const minecraftProcesses = processStore.processes;
  const selected = processStore.value;
  const current: Process = minecraftProcesses[selected];

  const onScrollPaneLoaded = useCallback((node: HTMLDivElement | null) => {
    node && (node.scrollTop = node.scrollHeight);
  }, []);

  const handleExport = () => {
    if (selected === -1) {
      openItemInFinder(ephLatestLog);
    } else {
      const logFile = path.join(
        ephLogs,
        `log.${new Date().getTime()}_${selected}.log`
      );
      fs.writeFileSync(logFile, current.outputs.join("\n"));
      openItemInFinder(logFile);
      showOverlay({
        title: t("tip"),
        message: t("processes.logExported", logFile),
      });
    }
  };
  const handleTerminate = () => {
    showOverlay({
      title: t("processes.terminate"),
      message: t("processes.terminateIrreversible"),
      positiveText: t("continueAnyway"),
      dangerous: true,
      cancellable: true,
      action: () => current.raw.kill(),
    });
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
                className="text-contrast overflow-y-auto rounded-lg bg-card shadow-md eph-h-full"
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
                <div className="p-6 break-all">
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
