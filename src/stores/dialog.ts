export interface DialogState {
  title: string;
  message: string;
  out: boolean;
  actionName?: string;
  action?: () => unknown;
  dangerous?: boolean;
}

type ChangeDialogCallback = () => unknown;

class DialogStore {
  state?: DialogState;
  fn?: ChangeDialogCallback;
  subscribe(fn: ChangeDialogCallback) {
    this.fn = fn;
  }
  invoke() {
    this.fn && this.fn();
  }
  clear() {
    if (this.state) {
      this.state.out = true;
      this.invoke();
      setTimeout(() => {
        delete this.state;
        this.invoke();
      }, 300);
    }
  }
  show(props: Omit<DialogState, "out">) {
    this.state = { ...props, out: false };
    this.invoke();
  }
}

export const dialogStore = new DialogStore();
