import "require-json5";
import React from "react";
import ReactDOM from "react-dom";
import App from "../components/App";
import { logger } from "./global";

logger.info("Renderer process started!");

ReactDOM.render(React.createElement(App), document.getElementById("root"));
