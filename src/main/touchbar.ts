import { BrowserWindow, TouchBar } from "electron";
const { TouchBarButton } = TouchBar;

export default function getTouchBar(win: BrowserWindow): TouchBar {
  return new TouchBar({
    items: [
      new TouchBarButton({
        label: "<-",
        click: () => {
          win.webContents.send("nav-back");
        },
      }),
    ],
  });
}
