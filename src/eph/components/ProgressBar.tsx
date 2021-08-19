export default function ProgressBar(props: {
  unlimited?: boolean;
  percentage?: number;
}): JSX.Element {
  if (props.percentage && props.percentage > 100 && props.percentage < 0) {
    throw new Error("Invalid progress number. 0-100 need.");
  }
  return (
    <div
      className={`eph-progress-bar ${props.unlimited ? "animate-pulse" : ""}`}
      style={{
        width: `${props.percentage ?? 100}%`,
      }}
    />
  );
}
