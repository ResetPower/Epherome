import { ProgressBar } from "@resetpower/rcs";
import { taskStore } from "common/task/store";
import { call } from "common/utils";
import { observer } from "mobx-react-lite";
import { CSSProperties, Ref, useEffect, useState } from "react";
import { MdCancel, MdOpenInNew } from "react-icons/md";
import JoinIn from "./JoinIn";

const TaskPanel = observer(
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
        className={`bg-card text-contrast border border-divider shadow-md rounded-md p-3 ${props.className}`}
      >
        <p>Task Manager</p>
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
          <div className="text-shallow">No Tasks</div>
        )}
      </div>
    );
  },
  { forwardRef: true }
);

export default TaskPanel;
