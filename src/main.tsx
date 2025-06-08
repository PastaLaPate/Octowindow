import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-simple-keyboard/build/css/index.css";
import App from "./App.tsx";

const rootElement = document.getElementsByTagName("html")[0];
if (rootElement) {
  rootElement.className = "dark";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
