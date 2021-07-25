import { useReducer } from "react";

export function useForceUpdater(): () => void {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return forceUpdate;
}

export interface Controller<T> {
  value: T;
  onChange: (value: T) => void;
}
