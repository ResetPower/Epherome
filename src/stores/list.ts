import { nanoid } from "nanoid";
import { cfg } from "./config";

export interface WithId {
  id: string;
}

export interface ListSerializable<T> {
  active?: string;
  data: (T & WithId)[];
}

export class List<T> implements ListSerializable<T> {
  active?: string;
  data: (T & WithId)[] = [];
  static from<T>(raw: ListSerializable<T> = { data: [] }): List<T> {
    const it = new List<T>();
    it.active = raw.active;
    it.data = raw.data;
    return it;
  }
  get isEmpty() {
    return this.data.length === 0;
  }
  current(): T | undefined {
    return this.find(this.active);
  }
  find(id?: string): T | undefined {
    return this.data.find((x) => x.id === id);
  }
  map<U>(fn: (value: T, id: string) => U): U[] {
    return this.data.map((value) => fn(value, value.id));
  }
  selected(id: string): boolean {
    return this.active === id;
  }
  select(id: string) {
    this.active = id;
    cfg.save();
  }
  unselect() {
    this.active = undefined;
  }
  add(element: T, autoSelect?: boolean): string {
    const id = nanoid();
    this.data.push({ ...element, id });
    autoSelect && this.select(id);
    cfg.save();
    return id;
  }
  remove(id: string) {
    this.data = this.data.filter((x) => x.id !== id);
    this.unselect();
    cfg.save();
  }
}
