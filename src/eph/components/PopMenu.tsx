import { DefaultFn } from "common/utils";
import { ListItem } from "./lists";

export default function PopMenu(props: {
  items: {
    icon: JSX.Element;
    text: string;
    onClick: DefaultFn;
  }[];
}): JSX.Element {
  return (
    <>
      {props.items.map((val, index) => (
        <ListItem
          className="rounded-lg p-2 bg-blue-600 bg-opacity-0 hover:bg-opacity-30 active:bg-opacity-50"
          key={index}
          onClick={val.onClick}
        >
          {val.icon} {val.text}
        </ListItem>
      ))}
    </>
  );
}
