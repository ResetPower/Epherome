import { useCallback, useState } from "react";

export function useForceUpdater(): () => void {
  const [, setState] = useState({});
  return useCallback(() => setState({}), []);
}

export interface Controller<T> {
  value: T;
  onChange: (value: T) => void;
}

export function useController<T>(initialValue: T): Controller<T> {
  const [value, setValue] = useState(initialValue);
  return { value, onChange: (newValue) => setValue(newValue) };
}
