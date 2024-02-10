import { useReducer } from "react";

export function resolve<T>(formData: FormData): T {
  const obj: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    obj[k] = v as string;
  }
  return obj as T;
}

export function uuidv4() {
  let result = "";
  for (let j = 0; j < 32; j++) {
    const i = Math.floor(Math.random() * 16)
      .toString(16)
      .toLowerCase();
    result = result + i;
  }
  return result;
}

export type ConcatElement = string | false | undefined;

export function concat(...elements: ConcatElement[]) {
  return elements.filter((x) => typeof x === "string").join(" ");
}

export type Status = "unavailable" | "loading" | "positive" | "negative";

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P];
};

export function deepMerge<T>(alpha: T, beta: Partial<T>): T {
  const result: T = Object.assign({}, alpha);
  for (const key of Object.keys(beta) as (keyof typeof beta)[]) {
    const value = beta[key];
    if (value)
      if (typeof value === "object") {
        result[key] = deepMerge(result[key], value);
      } else result[key] = value;
  }
  return result;
}

export function useForceUpdate() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}
