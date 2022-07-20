import { shift, useFloating } from "@floating-ui/react-dom";
import { IconButton, ProgressBar } from "@resetpower/rcs";
import { taskStore } from "common/task/store";
import { call } from "common/utils";
import { t } from "eph/intl";
import { observer } from "mobx-react-lite";
import {
  CSSProperties,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FaServer } from "react-icons/fa";
import { MdCancel, MdOpenInNew } from "react-icons/md";
import JoinIn from "./JoinIn";

const TaskPanelForwardRef = forwardRef(
  (
    props: { style?: CSSProperties; className?: string },
    ref: Ref<HTMLDivElement>
  ) => {
    const [pList, setPList] = useState<Record<string, number>>({});

    useEffect(() => {
      taskStore.onProgressChange = (i, p) =>
        setPList((pList) => ({ ...pList, [i]: p }));
      return () => (taskStore.onProgressChange = undefined);
    }, []);

    return (
      <div
        ref={ref}
        style={props.style}
        className={`bg-card text-contrast shadow-md z-20 rounded-md p-3 ${props.className}`}
      >
        <p>{t("task.manager")}</p>
        <JoinIn
          separator={<div className="border-t border-divider w-auto my-1" />}
        >
          {taskStore.tasks.map((t, i) => {
            const err = t.percentage === -2;
            const handleCancel = () => {
              !err && t.cancel();
              taskStore.finish(t);
            };

            return (
              <div className="flex items-center" key={i}>
                <div>
                  <div className="flex space-x-1">
                    <p className="text-shallow">#{t.id}</p>
                    <p className={err ? "text-danger" : ""}>{t.name}</p>
                  </div>
                  <ProgressBar percentage={pList[t.id] ?? t.percentage} />
                </div>
                <MdOpenInNew
                  onClick={() => call(t.opener)}
                  className="eph-small-icon-btn"
                />
                <MdCancel
                  onClick={handleCancel}
                  className="eph-small-icon-btn"
                />
              </div>
            );
          })}
        </JoinIn>
        {taskStore.tasks.length === 0 && (
          <div className="text-shallow text-sm">{t("task.noTasks")}</div>
        )}
      </div>
    );
  }
);

TaskPanelForwardRef.displayName = "TaskPanel";

const TaskPanel = observer(TaskPanelForwardRef);

export function TaskPanelShower(): JSX.Element {
  const { x, y, reference, floating, refs, strategy } =
    useFloating<HTMLElement>({
      placement: "bottom",
      middleware: [shift()],
    });
  const [show, setShow] = useState(false);
  const close = useCallback(
    (event: Event) => {
      if (
        !refs.reference.current?.contains(event.target as Node) &&
        !refs.floating.current?.contains(event.target as Node)
      ) {
        setShow(false);
      }
    },
    [refs]
  );

  useEffect(
    () =>
      (show ? document.addEventListener : document.removeEventListener)(
        "click",
        close
      ),
    [show, close]
  );

  return (
    <div>
      <div ref={reference}>
        <IconButton
          className="flex"
          onClick={() => setShow(!show)}
          active={show}
        >
          <FaServer size="1.2em" />
        </IconButton>
      </div>
      {show && (
        <TaskPanel
          className="z-20 right-1"
          ref={floating}
          style={{
            position: strategy,
            top: y ?? "",
            left: x ?? "",
          }}
        />
      )}
    </div>
  );
}
