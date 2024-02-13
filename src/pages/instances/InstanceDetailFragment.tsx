import { useState } from "react";
import Button from "../../components/Button";
import TabBar from "../../components/TabBar";
import { t } from "../../intl";
import { MinecraftInstance } from "../../stores/struct";
import Info from "../../components/Info";
import Center from "../../components/Center";

export default function InstanceDetailFragment(props: {
  current: MinecraftInstance;
  onRemove: () => unknown;
}) {
  const [value, setValue] = useState(0);
  const current = props.current;

  return (
    <div className="h-full">
      <TabBar
        tabs={["General", "Saves", "Resource Packs", "Mods", "Options"]}
        value={value}
        setValue={setValue}
      />
      {value === 0 && (
        <div>
          <Info name={t.name}>{current.name}</Info>
          <Info copyable={current.gameDir} code name={t.instances.gameDir}>
            {current.gameDir}
          </Info>
          <Info name={t.instances.version}>{current.version}</Info>
          <div className="flex justify-end">
            <Button onClick={props.onRemove} dangerous>
              {t.remove}
            </Button>
          </div>
        </div>
      )}
      {value >= 1 && value <= 4 && <div>{t.unsupported}</div>}
    </div>
  );
}
