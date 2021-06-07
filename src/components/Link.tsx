import { PureComponent } from "react";
import { shell } from "electron";

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
      <span className="text-blue-500 cursor-pointer select-none" onClick={this.handleClick}>
        {this.props.children}
      </span>
    );
  }
}
