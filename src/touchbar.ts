import { TouchBar, WebContents } from "electron";

export default function getTouchBar(webContents: WebContents): TouchBar {
  return new TouchBar({
    items: [
      new TouchBar.TouchBarButton({
        label: "Back",
        click: () => webContents.send("history-back"),
      }),
      new TouchBar.TouchBarLabel({
        label: "Welcome to Epherome!",
      }),
    ],
  });
}
