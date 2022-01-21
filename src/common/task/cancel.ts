import { DefaultFn } from "common/utils";

export class Canceller {
  fn?: DefaultFn;
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
      return true;
    } else {
      return false;
    }
  }
}
