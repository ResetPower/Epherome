export default function SectionTitle(props: { children: string }): JSX.Element {
  return (
    <div className="font-semibold text-lg mb-3 border-b border-divider">
      {props.children}
    </div>
  );
}
