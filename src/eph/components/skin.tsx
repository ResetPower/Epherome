import Image from "./Image";

export function Avatar(props: { uuid: string }): JSX.Element {
  return (
    <Image
      src={`https://crafthead.net/avatar/${props.uuid}`}
      className="w-7 h-7"
      rounded
    />
  );
}

export function Body(props: { uuid: string }): JSX.Element {
  return (
    <Image src={`https://crafthead.net/armor/body/${props.uuid}`} rounded />
  );
}

export function Cape(props: { uuid: string }): JSX.Element {
  return <Image src={`https://crafthead.net/cape/${props.uuid}`} rounded />;
}
