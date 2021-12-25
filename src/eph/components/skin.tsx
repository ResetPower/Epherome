import Image from "./Image";

export function Avatar(props: { uuid: string }): JSX.Element {
  return (
    <Image
      src={`https://mc-heads.net/avatar/${props.uuid}`}
      className="w-7 h-7"
      rounded
    />
  );
}

export function Body(props: { uuid: string }): JSX.Element {
  return (
    <Image
      className="w-40"
      src={`https://mc-heads.net/body/${props.uuid}`}
      rounded
    />
  );
}
