export function matchKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

export function Highlight(props: {
  keyword: string;
  children: string;
  className?: string;
}) {
  const text = props.children;
  const i = text.toLowerCase().indexOf(props.keyword.toLowerCase());
  if (i === -1) {
    return <div>{text}</div>;
  }
  const [before, keyword, after] = [
    text.slice(0, i),
    text.slice(i, i + props.keyword.length),
    text.slice(i + props.keyword.length),
  ];
  return (
    <div className={props.className}>
      <span>{before}</span>
      <span className="text-danger">{keyword}</span>
      <span>{after}</span>
    </div>
  );
}
