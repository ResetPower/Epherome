import { PureComponent } from "react";
import { shell } from "electron";
import "../styles/link.css";

export interface LinkProps {
  href: string;
  children: string;
}

export default class Link extends PureComponent<LinkProps> {
  handleClick = (): void => {
    shell.openExternal(this.props.href).then();
  };
  render(): JSX.Element {
    return (
      <span className="eph-link" onClick={this.handleClick}>
        {this.props.children}
      </span>
    );
  }
}
