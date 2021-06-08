import "../styles/index.css";
import "material-design-icons/iconfont/material-icons.css";
import { render } from "react-dom";
import App from "../components/App";

console.log("Welcome to Epherome!");

// mount application
render(<App />, document.getElementById("root"));
