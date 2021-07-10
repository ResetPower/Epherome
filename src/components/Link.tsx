import { Component } from "react";
import { shell } from "electron";

export interface LinkProps {
  href: string;
  children: string;
}

export default class Link extends Component<LinkProps> {
  handleClick = (): void => {
    shell.openExternal(this.props.href).then();
  };
  render(): JSX.Element {
    return (
      <span
        className="text-blue-500 hover:text-blue-600 cursor-pointer select-none"
        onClick={this.handleClick}
      >
        {this.props.children}
      </span>
    );
  }
}
