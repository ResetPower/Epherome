import { ReactNode } from "react";
import { call, DefaultFn } from "common/utils";
import {
  openInBrowser,
  openInFinder,
  openItemInFinder,
} from "common/utils/open";

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
      className={`eph-button ${
        props.variant === "contained"
          ? "eph-button-contained"
          : "eph-button-text"
      } ${props.className ?? ""}`}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export function TinyButton(props: {
  children: ReactNode;
  className?: string;
  paddingRight?: boolean;
  onClick?: DefaultFn;
}): JSX.Element {
  return (
    <div
      className={`text-contrast inline-flex items-center m-1 ${
        props.paddingRight ? "pr-1" : ""
      } rounded-md bg-black bg-opacity-0 hover:bg-opacity-5 cursor-pointer active:bg-opacity-10 transition-colors ${
        props.className
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}

export function IconButton(props: {
  children: ReactNode;
  className?: string;
  onClick?: DefaultFn;
  active?: boolean;
}): JSX.Element {
  return (
    <div
      className={`eph-icon-button  ${
        props.active && "eph-icon-button-active"
      } color-contrast ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
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
        onChange={(ev) => call(props.onChange, ev.target.value)}
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
  maxLength?: number;
  noSpinButton?: boolean;
  required?: boolean;
  onEnter?: DefaultFn;
}): JSX.Element {
  return (
    <div className={props.className}>
      {props.label && (
        <label className="eph-label">
          {props.label}{" "}
          {props.required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className={`flex ${props.fieldClassName ?? ""}`}>
        {props.icon && <div className="eph-textfield-icon">{props.icon}</div>}
        <input
          spellCheck="false"
          maxLength={props.maxLength}
          min={props.min}
          max={props.max}
          type={props.type}
          value={props.value}
          placeholder={props.placeholder}
          onKeyDown={
            props.onEnter
              ? (event) => {
                  if (event.key === "Enter") {
                    call(props.onEnter);
                  }
                }
              : undefined
          }
          onChange={(ev) => call(props.onChange, ev.target.value)}
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
          } ${props.noSpinButton ? "no-spin-button" : ""}`}
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

export function TinyTextField(props: {
  value?: string;
  onChange?: (ev: string) => unknown;
  placeholder?: string;
  className?: string;
  onEnter?: DefaultFn;
}): JSX.Element {
  return (
    <input
      value={props.value}
      onKeyPress={(ev) => ev.key === "Enter" && call(props.onEnter)}
      onChange={(ev) => call(props.onChange, ev.target.value)}
      placeholder={props.placeholder}
      className="appearance-none bg-inherit focus:outline-none border-b border-divider focus:border-primary"
    />
  );
}

export function Checkbox(props: {
  className?: string;
  children: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}): JSX.Element {
  return (
    <div className="flex items-center">
      <div
        className="eph-checkbox"
        onClick={() => call(props.onChange, !props.checked)}
      >
        <svg
          className={`eph-checkbox-svg ${props.checked ? "" : "hidden"}`}
          viewBox="0 0 20 20"
        >
          <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
        </svg>
      </div>
      {props.children}
    </div>
  );
}

export function Link(props: {
  href?: string;
  className?: string;
  type?: "url" | "file" | "folder" | "clickable";
  onClick?: DefaultFn;
  children?: ReactNode;
  paddingX?: boolean;
}): JSX.Element {
  const handleClick = () => {
    if (props.type === "file") {
      openItemInFinder(props.href ?? "");
    } else if (props.type === "folder") {
      openInFinder(props.href ?? "");
    } else if (props.type === "clickable") {
      call(props.onClick);
    } else {
      openInBrowser(props.href ?? "");
    }
  };
  return (
    <span
      className={`eph-link ${props.paddingX && "px-2"} ${
        props.className ?? ""
      }`}
      onClick={handleClick}
    >
      {props.children ?? props.href}
    </span>
  );
}
