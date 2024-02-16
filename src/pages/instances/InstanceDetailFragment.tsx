import { useState } from "react";
import Button from "../../components/Button";
import TabBar from "../../components/TabBar";
import { t } from "../../intl";
import { MinecraftInstance } from "../../stores/struct";
import Info from "../../components/Info";
import { cfg } from "../../stores/config";
import { getDateTimeString } from "../../utils";

export default function InstanceDetailFragment(props: {
  current: MinecraftInstance;
  onRemove: () => unknown;
  forceUpdate: () => unknown;
}) {
  const [value, setValue] = useState(0);
  const current = props.current;

  return (
    <div className="h-full">
      <TabBar
        tabs={[
          t.general,
          t.instances.saves,
          t.instances.resourcePacks,
          t.instances.mods,
          t.instances.options,
        ]}
        value={value}
        setValue={setValue}
      />
      {value === 0 && (
        <div>
          <Info
            editable={(newValue) => {
              current.name = newValue;
              cfg.saveAsync();
              props.forceUpdate();
            }}
            name={t.name}
          >
            {current.name}
          </Info>
          <Info copyable={current.gameDir} code name={t.instances.gameDir}>
            {current.gameDir}
          </Info>
          <Info name={t.instances.version}>{current.version}</Info>
          {current.time && (
            <Info name={t.createTime}>{getDateTimeString(current.time)}</Info>
          )}
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
