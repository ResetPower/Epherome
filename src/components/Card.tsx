import { ReactNode } from "react";

export default function Card(props: {
  children: ReactNode;
  className?: string;
  variant?: "outlined" | "contained";
}): JSX.Element {
  return (
    <div
      className={`${
        props.variant === "contained" ? "shadow-md" : "border border-divide"
      } p-3 bg-card rounded-md ${props.className}`}
    >
      {props.children}
    </div>
  );
}
