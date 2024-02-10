import { useState } from "react";
import Button from "../components/Button";
import formatString from "../core/stringFormatting";
import { tr } from "../internationalize";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{formatString(tr.counter.count, count.toString())}</p>
      <Button onClick={() => setCount(count + 1)} primary>
        {tr.counter.increase}
      </Button>
    </div>
  );
}
