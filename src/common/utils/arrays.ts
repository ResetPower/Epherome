export interface WithUnderline {
  selected?: boolean;
}

// "underline" toolkit for array list actions
export const _ = {
  select<T extends WithUnderline>(arr: T[], item: T): void {
    for (const i of arr) {
      i.selected && delete i.selected;
      i === item && (i.selected = true);
    }
  },
  index<T extends WithUnderline>(arr: T[], item: T): number | undefined {
    for (const i in arr) {
      if (arr[i] === item) {
        return +i;
      }
    }
  },
  selectByIndex<T extends WithUnderline>(arr: T[], index: number): void {
    this.select(arr, arr[index]);
  },
  deselect<T extends WithUnderline>(arr: T[]): void {
    for (const i of arr) {
      if (i.selected) {
        delete i.selected;
        break;
      }
    }
  },
  selected<T extends WithUnderline>(arr: T[]): T | undefined {
    return arr.find((value) => value.selected);
  },
  selectedIndex<T extends WithUnderline>(arr: T[]): number | undefined {
    for (const k in arr) {
      if (arr[k].selected) {
        return +k;
      }
    }
  },
  map<T extends WithUnderline, U>(
    arr: T[],
    cb: (value: T, id: number, index: number, array: T[]) => U
  ): U[] {
    const results: U[] = [];
    for (const k in arr) {
      const v = arr[k];
      results.push(cb(v, +k, +k, arr));
    }
    return results;
  },
  append<T extends WithUnderline>(arr: T[], item: T, select = false): void {
    arr.push(item);
    select && this.select(arr, item);
  },
  remove<T extends WithUnderline>(arr: T[], item: T): void {
    for (const k in arr) {
      if (arr[k] === item) {
        arr.splice(+k, 1);
        break;
      }
    }
  },
};
