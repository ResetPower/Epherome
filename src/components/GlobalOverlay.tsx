import { Component } from "react";
import { EmptyProps } from "../tools/types";
import { subscribe, unsubscribe } from "../renderer/session";
import { clearOverlayStack, overlayStack, shouldOverlayHide } from "../renderer/overlay";

export interface GlobalOverlayState {
  show: boolean;
}

export default class GlobalOverlay extends Component<EmptyProps, GlobalOverlayState> {
  state: GlobalOverlayState = {
    show: false,
  };
  subscribeIndex = 0;
  constructor(props: EmptyProps) {
    super(props);
    this.subscribeIndex = subscribe("global-overlay", (arg) => {
      arg === "updated" && this.setState({ show: overlayStack.length !== 0 });
    });
  }
  componentDidMount(): void {
    !this.state.show && clearOverlayStack();
  }
  componentWillUnmount(): void {
    unsubscribe(this.subscribeIndex);
  }
  render(): JSX.Element {
    return (
      <div
        className={`flex fixed pin inset-0 z-50 overflow-auto bg-black bg-opacity-50 ${
          !this.state.show ? "hidden" : ""
        }`}
      >
        {overlayStack.map((comp, index) => {
          return (
            <div
              className="justify-center mx-auto my-auto"
              hidden={shouldOverlayHide(index)}
              key={index}
            >
              {comp}
            </div>
          );
        })}
      </div>
    );
  }
}
