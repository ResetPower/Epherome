import { action, computed, makeObservable, observable } from "mobx";
import { Observer } from "mobx-react";
import { DefaultFn } from "../tools";
import { Transition } from "react-transition-group";
import { useRef } from "react";

export class OverlayStore {
  @observable
  stack: JSX.Element[] = [];

  constructor() {
    makeObservable(this);
  }
  @action
  show = (render: (close: DefaultFn) => JSX.Element): void => {
    const index = this.stack.length;
    this.stack[index] = render(() => this.remove(index));
  };
  @action
  remove = (id: number): void => {
    this.stack.splice(id);
  };
  @computed
  get current(): JSX.Element | undefined {
    return [...this.stack].pop();
  }
}

export const overlayStore = new OverlayStore();

export const showDialog = overlayStore.show;

// global dialog manager component
export function GlobalOverlay(): JSX.Element {
  const previous = useRef<JSX.Element | undefined>(undefined);

  return (
    <Observer>
      {() => {
        const overlay = overlayStore.current;
        overlay && (previous.current = overlay);

        return (
          <Transition in={!!overlay} timeout={300} unmountOnExit>
            {(state) => (
              <div className={`eph-global-overlay`}>
                <div className={`m-auto zoom-${state}`}>{previous.current}</div>
              </div>
            )}
          </Transition>
        );
      }}
    </Observer>
  );
}
