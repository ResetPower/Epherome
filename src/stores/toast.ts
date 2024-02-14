export type ToastType = "success" | "fail";

export interface ToastState {
  type: ToastType;
  message: string;
  description?: string;
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
  show(state: ToastState) {
    this.state = state;
    setTimeout(() => this.clear(), 3000);
    this.invoke();
  }
  success(message: string, description?: string) {
    this.state = { type: "success", message, description, out: false };
    setTimeout(() => this.clear(), 3000);
    this.invoke();
  }
  fail(message: string, description?: string) {
    this.state = { type: "fail", message, description, out: false };
    setTimeout(() => this.clear(), 3000);
    this.invoke();
  }
}

export const toastStore = new ToastStore();
