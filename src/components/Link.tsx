import React, { FunctionComponentElement } from "react";
import { shell } from "electron";
import { lightBlue } from "@material-ui/core/colors";

export interface LinkProps {
  href: string;
  children: string;
}

export default function Link(props: LinkProps): FunctionComponentElement<LinkProps> {
  const handleClick = () => {
    shell.openExternal(props.href);
  };
  return (
    <span
      style={{
        userSelect: "none",
        cursor: "pointer",
        color: lightBlue[500],
      }}
      onClick={handleClick}
    >
      {props.children}
    </span>
  );
}
