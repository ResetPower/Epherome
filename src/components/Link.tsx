import { PureComponent } from "react";
import { shell } from "electron";
import "../styles/link.css";

export interface LinkProps {
  href: string;
  children: string;
}

export default class Link extends PureComponent<LinkProps> {
  handleClick = () => {
    shell.openExternal(this.props.href).then();
  };
  render() {
    return (
      <span className="eph-link" onClick={this.handleClick}>
        {this.props.children}
      </span>
    );
  }
}
