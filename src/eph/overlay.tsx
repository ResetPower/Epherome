import { AnyMap, apply, combineFun, DefaultFn } from "common/utils";
import { Button, IconButton } from "@resetpower/rcs";
import { t } from "eph/intl";
import { observer } from "mobx-react-lite";
import { ReactNode, useRef } from "react";
import { MdArrowDownward } from "react-icons/md";
import { Transition } from "react-transition-group";
import { rendererLogger } from "common/loggers";
import { action, computed, makeObservable, observable } from "mobx";

export type GlobalOverlaySettings<P = AnyMap> = {
  type?: "dialog" | "sheet";
  title?: string;
  message?: string;
  positiveText?: string;
  dangerous?: boolean;
  action?: DefaultFn;
  cancellable?: boolean | DefaultFn;
  content?: (props: P) => JSX.Element;
  params?: P;
  bottomDivide?: boolean;
  fineCancel?: boolean;
  neutral?: {
    text: string;
    action: DefaultFn;
  };
};

export class GlobalOverlayStore {
  @observable
  private stack: GlobalOverlaySettings<unknown>[] = [];
  constructor() {
    makeObservable(this);
  }
  @action
  show = (settings: GlobalOverlaySettings<unknown>): void => {
    this.stack.push(settings);
    rendererLogger.info("Overlay stack add");
  };
  @action
  close = (): void => {
    this.stack.pop();
    rendererLogger.info("Overlay stack pop");
  };
  @computed
  get current(): GlobalOverlaySettings<unknown> | undefined {
    return this.stack.slice().pop();
  }
}

export const overlayStore = new GlobalOverlayStore();

// global dialog manager component
export const GlobalOverlay = observer(() => {
  const previous = useRef<GlobalOverlaySettings<unknown>>();
  const onClose = overlayStore.close;

  apply(overlayStore.current, (i) => (previous.current = i));
  const o = previous.current;

  return (
    <Transition in={!!overlayStore.current} timeout={300} unmountOnExit>
      {(state) =>
        o && (
          <div className="eph-overlay-background">
            {o.type === "sheet" ? (
              <div
                className={`flex flex-col h-full w-full items-center slide-${state}`}
              >
                <BottomSheet>
                  <BottomSheetTitle close={onClose}>
                    {o.title ?? t("tip")}
                  </BottomSheetTitle>
                  {o.message && <p>{o.message}</p>}
                  {o.content && <o.content {...((o.params as AnyMap) ?? {})} />}
                </BottomSheet>
              </div>
            ) : (
              <div className={`m-auto zoom-${state}`}>
                <Dialog>
                  <p className="font-semibold text-xl">{o.title ?? t("tip")}</p>
                  {o.message && <p>{o.message}</p>}
                  {o.content && <o.content {...((o.params as AnyMap) ?? {})} />}
                  <div className="flex">
                    {!o.bottomDivide && <div className="flex-grow" />}
                    {o.cancellable && (
                      <Button className="text-shallow" onClick={onClose}>
                        {o.fineCancel ? t("fine") : t("cancel")}
                      </Button>
                    )}
                    {o.neutral && (
                      <Button onClick={combineFun(o.neutral.action, onClose)}>
                        {o.neutral.text}
                      </Button>
                    )}
                    {o.bottomDivide && <div className="flex-grow" />}
                    <Button
                      className={o.dangerous ? "text-danger" : ""}
                      onClick={combineFun(o.action, onClose)}
                    >
                      {o.positiveText ?? t("fine")}
                    </Button>
                  </div>
                </Dialog>
              </div>
            )}
          </div>
        )
      }
    </Transition>
  );
});

function Dialog(props: {
  children: ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`eph-dialog eph-dialog-indent-bottom ${props.className ?? ""}`}
    >
      {props.children}
    </div>
  );
}

function BottomSheet(props: { children: ReactNode }): JSX.Element {
  return (
    <>
      <div className="flex-grow" />
      <div
        className="w-11/12 bg-card rounded-t-xl overflow-y-auto"
        style={{ height: "calc(100vh * 0.833333)" }}
      >
        {props.children}
      </div>
    </>
  );
}

function BottomSheetTitle({
  children,
  close,
}: {
  children: string;
  close: DefaultFn;
}): JSX.Element {
  return (
    <div className="flex items-center bg-card z-10 py-3 px-9 mb-3 shadow-sm top-0 sticky">
      <p className="font-semibold text-xl flex-grow">{children}</p>
      <IconButton onClick={close}>
        <MdArrowDownward />
      </IconButton>
    </div>
  );
}

export function showOverlay<P = AnyMap>(overlay: GlobalOverlaySettings<P>) {
  overlayStore.show(overlay as GlobalOverlaySettings<unknown>);
}
