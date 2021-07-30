export interface EmptyObject {
  [key: string]: never;
}

export interface StringMap {
  [key: string]: string;
}

// value or a function returns value (with or without parameters)
export type Accessible<T, P extends unknown[] = []> = T | ((...args: P) => T);

export type DefaultFn = () => unknown;
