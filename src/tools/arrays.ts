// get element in array by id
export function getById<T extends WithId>(arr: T[], id: number): T | null {
  for (const i of arr) {
    if (i.id === id) {
      return i;
    }
  }
  return null;
}

// get the id of next array item
export function getNextId<T extends WithId>(arr: T[]): number {
  return arr.length === 0 ? 0 : arr[arr.length - 1].id + 1;
}

// object type that contains an unique id
export interface WithId {
  id: number;
}
