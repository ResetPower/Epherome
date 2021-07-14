import { clearOverlayStack, overlayStack, shouldOverlayHide } from "../renderer/overlay";
import { Component } from "react";
import { EmptyObject } from "../tools/types";
import { unwrapFunction } from "../tools";

export interface GlobalOverlayState {
  show: boolean;
}

export const GlobalOverlaySpace = {
  updateOverlay: unwrapFunction(),
};

export default class GlobalOverlay extends Component<EmptyObject, GlobalOverlayState> {
  state: GlobalOverlayState = {
    show: false,
  };
  constructor(props: EmptyObject) {
    super(props);
    !this.state.show && clearOverlayStack();
    // init space
    GlobalOverlaySpace.updateOverlay = () => this.setState({ show: overlayStack.length !== 0 });
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
