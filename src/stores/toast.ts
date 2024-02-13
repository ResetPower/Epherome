export type ToastType = "success";

export interface ToastState {
  type: ToastType;
  message: string;
  out: boolean;
}

type ChangeToastCallback = () => unknown;

class ToastStore {
  state?: ToastState;
  fn?: ChangeToastCallback;
  subscribe(fn: ChangeToastCallback) {
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
  success(message: string) {
    this.state = { type: "success", message, out: false };
    setTimeout(() => this.clear(), 3000);
    this.invoke();
  }
}

export const toastStore = new ToastStore();
