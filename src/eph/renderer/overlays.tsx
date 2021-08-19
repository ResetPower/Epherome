import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { Transition } from "react-transition-group";
import { useRef } from "react";

export type OverlayType = "dialog" | "sheet";

export interface Overlay {
  element: JSX.Element;
  type: OverlayType;
  animationClassName: string;
}

export class OverlayStore {
  @observable
  stack: Overlay[] = [];

  constructor() {
    makeObservable(this);
  }
  @action
  show = (
    element: JSX.Element,
    type: OverlayType = "dialog",
    animationClassName = "zoom"
  ): void => {
    this.stack[this.stack.length] = {
      type,
      animationClassName,
      element,
    };
  };
  close = (): void => {
    this.remove(overlayStore.stack.length - 1);
  };
  @action
  remove = (index: number): void => {
    this.stack.splice(index, 1);
  };
  @computed
  get current(): Overlay | undefined {
    return this.stack.slice().pop();
  }
}

export const overlayStore = new OverlayStore();

export const showOverlay = overlayStore.show;

export function useOverlayCloser(): () => unknown {
  return overlayStore.close;
}

// global dialog manager component
export const GlobalOverlay = observer(() => {
  const previous = useRef<Overlay | undefined>(undefined);

  const overlay = overlayStore.current;
  overlay && (previous.current = overlay);

  return (
    <Transition in={!!overlay} timeout={300} unmountOnExit>
      {(state) => (
        <div className={`eph-global-overlay`}>
          <div
            className={`${
              previous.current?.type === "dialog"
                ? "m-auto"
                : "flex-grow flex flex-col items-center"
            } ${previous.current?.animationClassName}-${state}`}
          >
            {previous.current?.element}
          </div>
        </div>
      )}
    </Transition>
  );
});
