export class ObjectWrapper<T> {
  default: T;
  current: T;
  constructor(initial: T) {
    this.default = this.current = initial;
  }
  setToDefault = (): T => (this.current = this.default);
}
