import { useState } from "react";
import Button from "../components/Button";
import { t } from "../intl";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{t.counter.clicked(count)}</p>
      <Button onClick={() => setCount(count + 1)} primary>
        {t.counter.increase}
      </Button>
    </div>
  );
}
