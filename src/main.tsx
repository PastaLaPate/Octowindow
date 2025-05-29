import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "react-simple-keyboard/build/css/index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
