import { broadcast } from "./session";

export const overlayStack: JSX.Element[] = [];

export function getOverlay(): JSX.Element {
  return overlayStack[overlayStack.length - 1];
}

export function showDialog(render: (close: () => void) => JSX.Element): void {
  const index = overlayStack.length;
  const onClose = () => {
    overlayStack.splice(index, 1);
    broadcast("global-overlay", "updated");
  };
  overlayStack[index] = render(onClose);
  broadcast("global-overlay", "updated");
}
