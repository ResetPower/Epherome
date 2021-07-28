import { useReducer, useState } from "react";
import { EphConfig, ephConfigs } from "../struct/config";

export function useForceUpdater(): () => void {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

export function useConfig<K extends keyof EphConfig>(
  key: K
): [unknown, () => void] {
  const [value, setValue] = useState(ephConfigs[key]);
  return [value, () => setValue(ephConfigs[key])];
}

export interface Controller<T> {
  value: T;
  onChange: (value: T) => void;
}
