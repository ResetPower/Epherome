import { useEffect, useRef } from "react";
import { DefaultFunction } from "../tools/types";
import { throwNotInitError } from "../tools";
import { useForceUpdater } from "../tools/hooks";

export class OverlayService {
  static stack: JSX.Element[] = [];
  static updateOverlay: (action: "add" | "remove") => void = () =>
    throwNotInitError();
  static showDialog = (
    render: (close: DefaultFunction) => JSX.Element
  ): void => {
    const index = this.stack.length;
    this.stack[index] = render(() => {
      this.stack.splice(index, 1);
      this.updateOverlay("remove");
    });
    this.updateOverlay("add");
  };
}

export const showDialog = OverlayService.showDialog;

// global dialog manager component
export default function GlobalOverlay(): JSX.Element {
  const forceUpdate = useForceUpdater();
  const dialog = useRef<HTMLDivElement>(null);
  const overlay = [...OverlayService.stack].pop();

  useEffect(() => {
    OverlayService.updateOverlay = (action) => {
      const current = dialog.current;
      if (action === "remove" && current) {
        current.classList.remove("anime-zoom-in");
        current.classList.add("anime-zoom-out");
        setTimeout(() => {
          forceUpdate();
        }, 200);
      } else {
        forceUpdate();
      }
    };
  }, [forceUpdate]);

  return (
    <div className={`eph-global-overlay ${overlay ? "" : "hidden"}`}>
      {overlay && (
        <div className="m-auto anime-zoom-in" ref={dialog}>
          {overlay}
        </div>
      )}
    </div>
  );
}
