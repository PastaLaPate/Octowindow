import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { StoreManager } from "@/lib/octoprint/Octoprint";

export default function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    if (new StoreManager().store.connected) {
      navigate("/app/");
    } else {
      navigate("/setup/");
    }
  }, []);
  return <div />;
}
