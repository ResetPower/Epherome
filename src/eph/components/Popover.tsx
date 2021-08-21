import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { ReactNode } from "react";

export default function Popover(props: {
  button: (trigger: () => void, active: boolean) => ReactNode;
  className?: string;
  children?: ReactNode;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const open = useCallback(() => setShow(true), []);
  const close = useCallback(() => setShow(false), []);

  useEffect(() =>
    (show ? document.addEventListener : document.removeEventListener)(
      "click",
      close
    )
  );

  return (
    <div>
      {props.button(open, show)}
      {show && (
        <div className={`absolute right-1 ${props.className ?? ""}`}>
          {props.children}
        </div>
      )}
    </div>
  );
}
