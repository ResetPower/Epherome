import { createPopper } from "@popperjs/core";
import { ReactNode, useState, useRef } from "react";

export default function Popover(props: {
  children: ReactNode;
  popover: ReactNode;
  className?: string;
}): JSX.Element {
  const [show, setShow] = useState(false);
  const trigger = useRef<HTMLDivElement>(null);
  const popover = useRef<HTMLDivElement>(null);
  const open = () => {
    if (trigger.current && popover.current) {
      createPopper(trigger.current, popover.current, {
        placement: "bottom",
      });
      setShow(true);
    }
  };
  const close = () => setShow(false);
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full text-center">
          <div onClick={() => (show ? close() : open())} ref={trigger}>
            {props.children}
          </div>
          <div
            className={`${show ? "" : "hidden"} ${
              props.className ?? ""
            } z-20 bg-card rounded-lg shadow-md`}
            ref={popover}
          >
            {props.popover}
          </div>
        </div>
      </div>
    </>
  );
}
