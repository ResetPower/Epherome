import { useCallback, useState } from "react";

export function useForceUpdater(): () => void {
  const [, setState] = useState({});
  return useCallback(() => setState({}), []);
}
