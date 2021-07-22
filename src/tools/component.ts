import { Component } from "react";
import { EmptyObject } from "./types";

export class FlexibleComponent<P = EmptyObject, S = EmptyObject> extends Component<P, S> {
  updateUI = (): void => this.setState({});
}
