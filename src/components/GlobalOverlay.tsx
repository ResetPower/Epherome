import { subscribe, unsubscribe } from "../renderer/session";
import { clearOverlayStack, overlayStack, shouldOverlayHide } from "../renderer/overlay";
import { Component } from "react";
import { EmptyObject } from "../tools/types";

export interface GlobalOverlayState {
  show: boolean;
}

export default class GlobalOverlay extends Component<EmptyObject, GlobalOverlayState> {
  state: GlobalOverlayState = {
    show: false,
  };
  constructor(props: EmptyObject) {
    super(props);
    !this.state.show && clearOverlayStack();
  }
  componentDidMount(): void {
    subscribe("global-overlay", (arg) => {
      arg === "updated" && this.setState({ show: overlayStack.length !== 0 });
    });
  }
  componentWillUnmount(): void {
    unsubscribe("global-overlay");
  }
  render(): JSX.Element {
    return (
      <div
        className={`flex fixed pin inset-0 z-50 overflow-auto bg-black bg-opacity-50 ${
          !this.state.show ? "hidden" : ""
        }`}
      >
        {overlayStack.map((comp, index) => (
          <div
            className="justify-center mx-auto my-auto"
            hidden={shouldOverlayHide(index)}
            key={index}
          >
            {comp}
          </div>
        ))}
      </div>
    );
  }
}
