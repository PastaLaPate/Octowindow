import { StoreManager } from "@/lib/octoprint/Octoprint";
import { useNavigate } from "react-router";

export default function Index() {
  const navigate = useNavigate();
  if (new StoreManager().store.connected) {
    navigate("/app/");
  } else {
    navigate("/setup/");
  }
  return <div />;
}
