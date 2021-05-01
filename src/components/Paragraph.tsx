import React from "react";

export interface ParagraphProps {
  padding?: "top" | "bottom" | "none" | "both";
  children: unknown;
}

export default function Paragraph(
  props: ParagraphProps
): React.FunctionComponentElement<ParagraphProps> {
  const padding = props.padding ?? "bottom";
  return (
    <div>
      {(padding === "top" || padding === "both") && <br />}
      {props.children}
      {(padding === "bottom" || padding === "both") && <br />}
    </div>
  );
}
