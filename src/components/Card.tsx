import { ReactNode } from "react";

export default function Card(props: { children: ReactNode; className?: string }) {
  return (
    <div className={`border border-divide p-3 bg-card rounded-md ${props.className}`}>
      {props.children}
    </div>
  );
}
