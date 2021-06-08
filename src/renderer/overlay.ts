import { broadcast } from "./session";

export const overlayStack: JSX.Element[] = [];

export function getOverlay(): JSX.Element {
  return overlayStack[overlayStack.length - 1];
}

// returns ( closeDialog )
export function showDialog(render: (close: () => void) => JSX.Element): () => void {
  const index = overlayStack.length;
  const onClose = () => {
    overlayStack.splice(index, 1);
    broadcast("global-overlay", "updated");
  };
  overlayStack[index] = render(onClose);
  broadcast("global-overlay", "updated");
  return onClose;
}

// returns [openDialog, closeDialog]
export function makeDialog(render: (close: () => void) => JSX.Element): [() => void, () => void] {
  const index = overlayStack.length;
  const onClose = () => {
    overlayStack.splice(index, 1);
    broadcast("global-overlay", "updated");
  };
  return [
    () => {
      overlayStack[index] = render(onClose);
      broadcast("global-overlay", "updated");
    },
    onClose,
  ];
}
