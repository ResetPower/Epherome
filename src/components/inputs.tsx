import { shell } from "electron";
import { ReactNode } from "react";
import { unwrapFunction } from "../tools";
import { DefaultFn } from "../tools";
import { Typography } from "./layouts";

export function Button(props: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: DefaultFn;
  variant?: "contained" | "text";
}): JSX.Element {
  return (
    <button
      disabled={props.disabled ?? false}
      type="button"
      className={`eph-button eph-button-${props.variant ?? "text"} ${
        props.className ?? ""
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export function IconButton(props: {
  children: ReactNode;
  className?: string;
  onClick?: DefaultFn;
}): JSX.Element {
  return (
    <button
      className={`eph-icon-button color-contrast ${props.className ?? ""}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export function Select(props: {
  value: string | number;
  label?: string;
  onChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
}): JSX.Element {
  return (
    <div>
      {props.label && <label className="eph-label">{props.label}</label>}
      <select
        value={props.value}
        onChange={(ev) => unwrapFunction(props.onChange)(ev.target.value)}
        className={`eph-select ${props.className ?? ""}`}
        disabled={props.disabled}
      >
        {props.children}
      </select>
    </div>
  );
}

export function TextField(props: {
  label?: string;
  placeholder?: string;
  icon?: JSX.Element;
  type?: string;
  helperText?: string;
  error?: boolean;
  trailing?: JSX.Element;
  value?: string;
  className?: string;
  fieldClassName?: string;
  onChange?: (ev: string) => unknown;
  min?: number;
  max?: number;
}): JSX.Element {
  return (
    <div className={props.className}>
      {props.label && <label className="eph-label">{props.label}</label>}
      <div className={`flex ${props.fieldClassName ?? ""}`}>
        {props.icon && <div className="eph-textfield-icon">{props.icon}</div>}
        <input
          min={props.min}
          max={props.max}
          type={props.type}
          value={props.value}
          placeholder={props.placeholder}
          onChange={(ev) => unwrapFunction(props.onChange)(ev.target.value)}
          className={`${
            props.icon && props.trailing
              ? "rounded-none"
              : props.icon
              ? "rounded-r-lg"
              : props.trailing
              ? "rounded-l-lg"
              : "rounded-lg"
          } eph-textfield z-10 ${
            props.error
              ? "ring-1 ring-red-500"
              : "focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
          }`}
        />
        {props.trailing && (
          <div className="eph-textfield-trailing">{props.trailing}</div>
        )}
      </div>
      {props.helperText && (
        <p
          className={`eph-helper-text ${
            props.error ? "eph-helper-text-error" : ""
          }`}
        >
          {props.helperText}
        </p>
      )}
    </div>
  );
}

export function Checkbox(props: {
  children: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}): JSX.Element {
  return (
    <div className="flex items-center">
      <div className="eph-checkbox">
        <input
          type="checkbox"
          className="opacity-0 absolute"
          checked={props.checked}
          onChange={(ev) =>
            unwrapFunction(props.onChange)(ev.currentTarget.checked)
          }
        />
        <svg
          className={`eph-checkbox-svg ${props.checked ? "" : "hidden"}`}
          viewBox="0 0 20 20"
        >
          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
        </svg>
      </div>
      <Typography className="whitespace-nowrap">{props.children}</Typography>
    </div>
  );
}

export function Link(props: {
  href?: string;
  className?: string;
  type?: "url" | "file" | "clickable";
  onClick?: DefaultFn;
  children: string;
}): JSX.Element {
  const handleClick = () => {
    if (props.type === "file") {
      shell.showItemInFolder(props.href ?? "");
    } else if (props.type === "clickable") {
      unwrapFunction(props.onClick)();
    } else {
      shell.openExternal(props.href ?? "").then();
    }
  };
  return (
    <span className={`eph-link ${props.className ?? ""}`} onClick={handleClick}>
      {props.children}
    </span>
  );
}
