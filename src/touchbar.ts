import { TouchBar } from "electron";
const { TouchBarLabel } = TouchBar;

export default function getTouchBar(): TouchBar {
  return new TouchBar({
    items: [
      new TouchBarLabel({
        label: "Welcome to Epherome!",
      }),
    ],
  });
}
