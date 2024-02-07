import { useState } from "react";
import Button from "../components/Button";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You've clicked the button for {count} times.</p>
      <Button onClick={() => setCount(count + 1)} primary>
        Increase
      </Button>
    </div>
  );
}
