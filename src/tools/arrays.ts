export type WithSelected<T> = T & { selected?: boolean };

export class SelectableArray<T> extends Array<WithSelected<T>> {
  constructor(...items: T[]) {
    super(...items);
  }
  static create<T>(arr?: SelectableArray<T>): SelectableArray<T> {
    return new SelectableArray(...(arr ? (arr as Array<T>) : []));
  }
  remove(item: T): void {
    for (const k in this) {
      if (this[k] === item) {
        this.splice(+k, 1);
        break;
      }
    }
  }
  select(item: T): void {
    for (const i of this) {
      i.selected && delete i.selected;
      if (item === i) {
        i.selected = true;
        break;
      }
    }
  }
  deselect(): void {
    delete this.getSelected()?.selected;
  }
  getSelected(): WithSelected<T> | undefined {
    return this.find((value) => value.selected);
  }
  getSelectedIndex(): number | undefined {
    for (const k in this) {
      const v = this[k];
      if (v.selected) {
        return +k;
      }
    }
    return undefined;
  }
}
