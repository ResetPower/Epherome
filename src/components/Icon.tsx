export default function Icon(props: { children: string }): JSX.Element {
  return <i className="material-icons">{props.children}</i>;
}
