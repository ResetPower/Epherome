import { LegacyRef, forwardRef } from "react";

const TinyInput = forwardRef(
  (
    props: {
      initialValue: string;
      onSubmit: (value: string) => unknown;
      autoFocus?: boolean;
    },
    ref?: LegacyRef<HTMLInputElement>
  ) => (
    <input
      className="border-b border-blue-500 focus:outline-none"
      defaultValue={props.initialValue}
      onKeyDown={(e) => {
        if (e.key === "Enter") props.onSubmit(e.currentTarget.value);
      }}
      ref={ref}
      autoFocus={props.autoFocus}
    />
  )
);

export default TinyInput;
