import { KeyOfLanguageDefinition } from "eph/intl";

export function pushToHistory(
  pathname: KeyOfLanguageDefinition,
  params?: string
) {
  location.hash = pathname + (params ?? "");
}
