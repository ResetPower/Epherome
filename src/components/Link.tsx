import { Component } from "react";
import { shell } from "electron";

export interface LinkProps {
  href: string;
  className?: string;
  type?: "url" | "file";
  children: string;
}

export default class Link extends Component<LinkProps> {
  handleClick = (): void => {
    if (this.props.type === "file") {
      shell.showItemInFolder(this.props.href);
    } else {
      shell.openExternal(this.props.href);
    }
  };
  render(): JSX.Element {
    return (
      <span
        className={`text-blue-500 hover:text-blue-600 cursor-pointer select-none ${this.props.className}`}
        onClick={this.handleClick}
      >
        {this.props.children}
      </span>
    );
  }
}
