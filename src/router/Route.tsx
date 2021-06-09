import { StringMap } from "../tools/i18n";

export interface RouteProps {
  component: (params: StringMap) => JSX.Element;
  path: string;
  params?: string | number[];
}

// route component
export default function Route(_props: RouteProps): JSX.Element {
  return <></>;
}
