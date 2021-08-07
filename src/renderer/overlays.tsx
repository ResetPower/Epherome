import { action, computed, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import { DefaultFn } from "../tools";
import { Transition } from "react-transition-group";
import { useRef } from "react";

export type OverlayType = "dialog" | "sheet";

export interface Overlay {
  type: OverlayType;
  animationClass: string;
  element: JSX.Element;
}

export class OverlayStore {
  @observable
  stack: Overlay[] = [];

  constructor() {
    makeObservable(this);
  }
  @action
  show = (
    render: (close: DefaultFn) => JSX.Element,
    type: OverlayType = "dialog",
    animationClass = "zoom"
  ): void => {
    const index = this.stack.length;
    this.stack[index] = {
      type,
      animationClass,
      element: render(() => this.remove(index)),
    };
  };
  @action
  remove = (id: number): void => {
    this.stack.splice(id, 1);
  };
  @computed
  get current(): Overlay | undefined {
    return [...this.stack].pop();
  }
}

export const overlayStore = new OverlayStore();

export const showOverlay = overlayStore.show;

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
            } ${previous.current?.animationClass}-${state}`}
          >
            {previous.current?.element}
          </div>
        </div>
      )}
    </Transition>
  );
});
