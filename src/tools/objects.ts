export default function unwrapFunction<P>(
  func: ((...args: P[]) => void) | undefined
): (...args: P[]) => void {
  return (
    func ??
    (() => {
      /* */
    })
  );
}
