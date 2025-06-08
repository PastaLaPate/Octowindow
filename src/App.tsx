import { useState } from "react";
import "./App.css";
import Setup from "./setup/Setup";
import { StoreManager } from "./lib/octoprint/Octoprint";
import Home from "./Home";

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(
    new StoreManager().store.connected
  );
  return (
    <div className="dark">
      {!isSetupComplete ? (
        <Setup onCompleted={() => setIsSetupComplete(true)} />
      ) : (
        <Home />
      )}
    </div>
  );
}

export default App;
