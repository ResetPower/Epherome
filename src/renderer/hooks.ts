import React, { useState } from "react";
import { readConfig, writeConfig } from "./config";
import { getSession, subscribe, unsubscribe } from "./session";

export function useBooleanState(value: boolean): [boolean, () => void, () => void, () => void] {
  const state = useState(value);
  return [
    state[0], /// state
    () => state[1](true), // openState
    () => state[1](false), // closeState
    () => state[1](!state[0]), // toggleState
  ];
}

export function useConfigState<T>(key: string, def: T): [T, (value: T) => void, () => void] {
  const state = useState<T>(readConfig(key, def));
  return [
    state[0], // state
    (value: T) => {
      state[1](value);
      writeConfig(key, value, true);
    }, // setState
    () => {
      state[1](readConfig(key, def));
    }, // updateState
  ];
}

export function useBindingState<T>(
  value: T
): [T, (ev: React.ChangeEvent<{ value: unknown }>) => void, (value: T) => void] {
  const state = useState(value);
  return [
    state[0], // state
    (ev: React.ChangeEvent<{ value: unknown }>) => {
      state[1](ev.target.value as T);
    }, // changeState
    (value: T) => {
      state[1](value);
    }, // setState
  ];
}

export function useSessionState<T>(key: string): [T, () => void] {
  const val = getSession<T>(key);
  const state = useState(val);
  const index = subscribe({
    key,
    onUpdate: (value) => {
      state[1](value as T);
    },
  });
  return [
    val, // state
    () => {
      unsubscribe(index);
    }, // unsubscribe
  ];
}
