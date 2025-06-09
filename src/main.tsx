import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "react-simple-keyboard/build/css/index.css";

import { BrowserRouter, Route, Routes, useNavigate } from "react-router";

import App from "./routes/app/App.tsx";
import Home from "./routes/app/Home.tsx";
import PrintPage from "./routes/app/Print.tsx";
import Index from "./routes/Index.tsx";
import Setup from "./routes/setup/Setup.tsx";

const rootElement = document.getElementsByTagName("html")[0];
if (rootElement) {
  rootElement.className = "dark";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<Index />} />
        <Route path="/app" element={<App />}>
          <Route index element={<Home />} />
          <Route path="/app/print" element={<PrintPage />} />
        </Route>
        <Route
          path="/setup"
          element={
            <Setup
              onCompleted={() => {
                setTimeout(() => {
                  useNavigate()("/app");
                }, 1000);
              }}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
