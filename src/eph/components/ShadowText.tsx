export default function ShadowText(props: { children: string }): JSX.Element {
  return (
    <div
      className="text-white flex text-lg justify-end px-4"
      style={{
        textShadow: "0 0 2px black",
      }}
    >
      {props.children}
    </div>
  );
}
