import { useState } from "react";
import { DefaultFn, LoadingStatus, unwrapFunction } from "../tools";

export default function Image(props: {
  src: string;
  className?: string;
  rounded?: boolean;
  onError?: DefaultFn;
}): JSX.Element {
  const [status, setStatus] = useState<LoadingStatus>("pending");

  return (
    <img
      className={`${props.className ?? ""} ${
        props.rounded ? "rounded-lg" : ""
      } ${status !== "done" ? "invisible" : ""}`}
      src={props.src}
      onLoad={() => setStatus("done")}
      onError={() => {
        setStatus("error");
        unwrapFunction(props.onError)();
      }}
    />
  );
}
