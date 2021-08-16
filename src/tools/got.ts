import got, { Response } from "got";
import { useEffect, useState } from "react";

export function useGot<T>(
  url: string,
  transformer: (resp: Response) => T
): [T | undefined, boolean] {
  const [value, setValue] = useState<T | undefined | null>(undefined);

  useEffect(() => {
    got(url)
      .then((resp) => setValue(transformer(resp)))
      .catch(() => setValue(null));
  });

  return [value ?? undefined, value === null];
}
