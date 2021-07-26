export type WithSelected<T> = T & { selected?: boolean };

export class SelectableArray<T> extends Array<WithSelected<T>> {
  select(index: number): void {
    this.deselect();
    this[index].selected = true;
  }
  deselect(): void {
    delete this.getSelected()?.selected;
  }
  getSelected(): WithSelected<T> | undefined {
    return this.find((value) => value.selected);
  }
}
