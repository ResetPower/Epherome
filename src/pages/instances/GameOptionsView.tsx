import Alert from "../../components/Alert";
import TinyInput from "../../components/TinyInput";
import { InstanceService } from "../../services/instance";

export default function GameOptionsView(props: { service: InstanceService }) {
  return (
    <div className="p-3 space-y-1">
      <Alert>Don't modify the values unless you know what you're doing.</Alert>
      {props.service.gameOptions.map(([k, v], index) => (
        <div className="flex" key={index}>
          <div className="flex-grow">{k}</div>
          <TinyInput onSubmit={() => {}} initialValue={v} />
        </div>
      ))}
    </div>
  );
}
