import { ReactNode } from "react";

export default function SelectItem(props: {
  value?: string | number;
  children: ReactNode;
}): JSX.Element {
  return <option value={props.value}>{props.children}</option>;
}
