import React from "react";
import ReactDOM from "react-dom";
import App from "../components/App";
import { logger } from "./global";

logger.info("Renderer process started!");

console.log("Welcome to Epherome!");

ReactDOM.render(React.createElement(App), document.getElementById("root"));
