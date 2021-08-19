import { useState } from "react";
import { call, DefaultFn, LoadingStatus } from "common/utils";

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
        call(props.onError);
      }}
    />
  );
}
