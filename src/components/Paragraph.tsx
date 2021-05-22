import { PureComponent } from "react";

export interface ParagraphProps {
  padding?: "top" | "bottom" | "none" | "both";
  children: unknown;
}

export default class Paragraph extends PureComponent<ParagraphProps> {
  render() {
    const padding = this.props.padding ?? "bottom";
    return (
      <div>
        {(padding === "top" || padding === "both") && <br />}
        {this.props.children}
        {(padding === "bottom" || padding === "both") && <br />}
      </div>
    );
  }
}
