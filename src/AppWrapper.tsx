import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";

import App from "./routes/app/App";
import Control from "./routes/app/Control";
import Home from "./routes/app/Home";
import PrintPage from "./routes/app/Print";
import Settings from "./routes/app/Settings";
import Index from "./routes/Index";
import Setup from "./routes/setup/Setup";

export default function AppWrapper() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes>
        <Route index element={<Index />} />
        <Route path="/app" element={<App />}>
          <Route index element={<Home />} />
          <Route path="/app/print" element={<PrintPage />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/control" element={<Control />} />
        </Route>
        <Route path="/setup" element={<Setup />} />
      </Routes>
    </AnimatePresence>
  );
}
