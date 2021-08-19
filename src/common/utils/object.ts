export class ObjectWrapper<T> {
  current: T;
  constructor(initial: T) {
    this.current = initial;
  }
}
