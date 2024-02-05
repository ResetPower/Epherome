import type { Route } from "../App";
import IconButton from "./IconButton";

export default function Sidebar(props: {
  routeMap: { [key: string]: JSX.Element[] };
  route: string;
  setRoute: (route: Route) => unknown;
}) {
  return (
    <div className="p-1 m-1 rounded border shadow flex flex-col space-y-1">
      {Object.entries(props.routeMap).map(
        ([key, [icon]], ind) =>
          icon && (
            <IconButton
              key={ind}
              onClick={() => props.setRoute(key as Route)}
              active={props.route === key}
            >
              {icon}
            </IconButton>
          )
      )}
    </div>
  );
}
