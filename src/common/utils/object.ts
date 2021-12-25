export class ObjectWrapper<T> {
  default: T;
  current: T;
  constructor(initial: T) {
    this.default = this.current = initial;
  }
  setValue = (value: T): T => (this.current = value);
  setToDefault = (): T => (this.current = this.default);
}

export class Counter {
  private inner = 0;
  load(): number {
    return this.inner;
  }
  count(): number {
    return this.inner++;
  }
}
