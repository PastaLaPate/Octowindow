import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "react-simple-keyboard/build/css/index.css";
import "./index.css";

import { BrowserRouter } from "react-router-dom";

import AppWrapper from "./AppWrapper.tsx";

import "./TranslationManager.tsx";

const rootElement = document.getElementsByTagName("html")[0];
if (rootElement) {
  rootElement.className = "dark";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="page-container">
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </div>
  </StrictMode>
);
