import React from "react";
import ReactDOM from "react-dom";
import App from "../components/App";
import { logger } from "./global";

logger.info("Renderer process started!");

console.log("Welcome to Epherome!");
console.log("LONG LIVE THE ELECTRON!!!");
console.log("LONG LIVE THE REACT!!!");
console.log("LONG LIVE THE WEBPACK!!!");
console.log("好，我不得不说一句：ResetPower NB!!!!!!!");
console.log("好兄弟，你居然打开了开发者工具，你想干什么！！！");

ReactDOM.render(React.createElement(App), document.getElementById("root"));
