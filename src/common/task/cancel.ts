import { DefaultFn } from "common/utils";

export class Canceller {
  fn?: DefaultFn;
  cancelled = false;
  constructor(fn?: DefaultFn) {
    fn && (this.fn = fn);
  }
  clear() {
    this.fn = undefined;
  }
  update(fn: DefaultFn) {
    this.fn = fn;
  }
  cancel(): boolean {
    if (this.fn) {
      this.fn();
      this.cancelled = true;
      return true;
    } else {
      return false;
    }
  }
}
