const { TouchBar } = require("electron");
const { TouchBarButton, TouchBarLabel } = TouchBar;

module.exports = function getTouchBar(win) {
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
};
