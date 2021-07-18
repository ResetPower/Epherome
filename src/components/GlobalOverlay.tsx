import { Component } from "react";
import { DefaultFunction, EmptyObject } from "../tools/types";
import { throwNotInitError } from "../tools";

export interface GlobalOverlayState {
  show: boolean;
}

export default class GlobalOverlay extends Component<EmptyObject, GlobalOverlayState> {
  state: GlobalOverlayState = {
    show: false,
  };
  stack: JSX.Element[] = [];
  static showDialog: (render: (close: DefaultFunction) => JSX.Element) => void = (): void =>
    throwNotInitError();

  updateOverlay(): void {
    this.setState({ show: this.stack.length !== 0 });
  }
  shouldOverlayHide(index: number): boolean {
    return index !== this.stack.length - 1;
  }
  clearOverlayStack(): void {
    this.stack.length !== 0 && this.stack.slice(0, 0);
  }

  constructor(props: EmptyObject) {
    super(props);
    !this.state.show && this.clearOverlayStack();

    // init static
    GlobalOverlay.showDialog = (
      render: (close: DefaultFunction) => JSX.Element
    ): DefaultFunction => {
      const index = this.stack.length;
      const onClose = () => {
        this.stack.splice(index, 1);
        this.updateOverlay();
      };
      const component = render(onClose);
      this.stack[index] = component;
      this.updateOverlay();
      return onClose;
    };
  }

  render(): JSX.Element {
    return (
      <div
        className={`flex fixed pin inset-0 z-50 overflow-auto bg-black bg-opacity-50 ${
          this.state.show ? "" : "hidden"
        }`}
      >
        {this.stack.map((comp, index) => (
          <div
            className="justify-center mx-auto my-auto"
            hidden={this.shouldOverlayHide(index)}
            key={index}
          >
            {comp}
          </div>
        ))}
      </div>
    );
  }
}
