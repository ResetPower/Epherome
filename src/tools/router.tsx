import { unwrapAccessible, unwrapFunction } from ".";
import { Accessible, StringMap } from "./types";
import { EphHistory } from "./history";
import { Component } from "react";

export interface Route {
  pathname: string;
  component: Accessible<JSX.Element, [StringMap]>;
  title: Accessible<string>;
}

export interface RouterProps {
  initial: string;
  routes: Route[];
  history: EphHistory;
  className?: string;
  onChange?: (title: string) => void;
}

export interface RouterState {
  route?: Route;
  mainClassName: string;
}

// simple router toolkit
export class Router extends Component<RouterProps, RouterState> {
  state: RouterState = { mainClassName: "" };
  componentDidMount(): void {
    const initial = this.props.initial;
    const hist = this.props.history;
    hist.listen(() => {
      const route = this.props.routes.find((value) => value.pathname === hist.location.pathname);
      this.setState({ route, mainClassName: "anime-fade-out" });
      unwrapFunction(this.props.onChange)(route ? unwrapAccessible(route.title) : "");
    });
    hist.listenAnime(() => this.setState({ mainClassName: "anime-fade-in" }));
    initial && hist.push(initial);
  }
  render(): JSX.Element {
    const route = this.state.route;
    return (
      <div className={this.state.mainClassName}>
        {route ? unwrapAccessible(route.component, this.props.history.location.params) : null}
      </div>
    );
  }
}
