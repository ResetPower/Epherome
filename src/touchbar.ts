import { BrowserWindow, TouchBar } from "electron";
const { TouchBarButton, TouchBarLabel } = TouchBar;

export default function getTouchBar(win: BrowserWindow): TouchBar {
  return new TouchBar({
    items: [
      new TouchBarButton({
        label: "Back",
        click: () => {
          win.webContents.send("nav-back");
        },
      }),
      new TouchBarLabel({
        label: "Welcome to Epherome!",
      }),
    ],
  });
}
