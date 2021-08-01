export interface WithSelected {
  selected?: boolean;
}

// array toolkit set
export const _ = {
  select<T extends WithSelected>(arr: T[], item: T): void {
    for (const i of arr) {
      i.selected && delete i.selected;
      if (item === i) {
        i.selected = true;
        break;
      }
    }
  },
  deselect<T extends WithSelected>(arr: T[]): void {
    for (const i of arr) {
      i.selected && delete i.selected;
      break;
    }
  },
  selected<T extends WithSelected>(arr: T[]): T | undefined {
    return arr.find((value) => value.selected);
  },
  selectedIndex<T extends WithSelected>(arr: T[]): number | undefined {
    for (const k in arr) {
      if (arr[k].selected) {
        return +k;
      }
    }
  },
  append<T extends WithSelected>(arr: T[], item: T, select = false): void {
    select && (item.selected = true);
    arr.push(item);
  },
  remove<T extends WithSelected>(arr: T[], item: T): void {
    for (const k in arr) {
      if (arr[k] === item) {
        arr.splice(+k);
      }
    }
  },
};
