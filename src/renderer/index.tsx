import "../styles/index.css";
import "material-design-icons/iconfont/material-icons.css";
import { render } from "react-dom";
import App from "../components/App";
import "tailwindcss/components.css";
import "tailwindcss/utilities.css";

console.log("Welcome to Epherome!");

// mount application
render(<App />, document.getElementById("root"));
