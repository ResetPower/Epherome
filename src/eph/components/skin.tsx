import Image from "./Image";
import Steve from "../../assets/Steve.png";

export function Avatar(props: { uuid: string }): JSX.Element {
  return (
    <Image
      src={
        props.uuid === "Steve"
          ? Steve
          : `https://crafatar.com/avatars/${props.uuid}`
      }
      className="w-7 h-7"
      rounded
    />
  );
}

export function Body(props: { uuid: string }): JSX.Element {
  return (
    <Image
      className="w-40"
      src={`https://crafatar.com/renders/body/${props.uuid}`}
      rounded
    />
  );
}
