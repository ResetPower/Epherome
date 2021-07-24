import { useReducer, useState } from "react";
import { DefaultFunction } from "./types";

export function useForceUpdater(): () => void {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

export interface Controller<T> {
  value: T;
  onChange: (value: T) => void;
}

// combines value and onChange
// usage: <input {...controller} />
export function useController<T>(initialValue: T, effect?: DefaultFunction): Controller<T> {
  const [value, setValue] = useState(initialValue);
  return {
    value,
    onChange: effect
      ? (ev: T) => {
          setValue(ev);
          effect();
        }
      : setValue,
  };
}
