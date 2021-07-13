import { DefaultFunction } from "../tools/types";
import { broadcast } from "./session";

export const overlayStack: JSX.Element[] = [];

// to see if the overlay should be shown
export function shouldOverlayHide(index: number): boolean {
  return index !== overlayStack.length - 1;
}

export function clearOverlayStack(): void {
  overlayStack.length !== 0 && overlayStack.slice(0, 0);
}

// returns `closeDialog`
export function showDialog(render: (close: DefaultFunction) => JSX.Element): DefaultFunction {
  const index = overlayStack.length;
  const onClose = () => {
    overlayStack.splice(index, 1);
    broadcast("global-overlay", "updated");
  };
  const component = render(onClose);
  overlayStack[index] = component;
  broadcast("global-overlay", "updated");
  return onClose;
}
