import type { OctoprintNode } from "@/lib/octoprint/Octoprint";
import SetupFrame from "./SetupFrame";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type AuthorizationProps = {
  node: OctoprintNode;
};

export default function Authorization({ node }: AuthorizationProps) {
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async () => {
    setLoading(true);
    await node.authenticate();
    setLoading(false);
  };

  return (
    <SetupFrame
      key={"authorization"}
      className="flex flex-col items-center justify-center"
    >
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold">Authentification</h1>
        {/*<button
            className="ml-2 p-3 rounded-full hover:bg-gray-700 active:bg-gray-600 transition"
            style={{ touchAction: "manipulation" }}
            aria-label="Refresh"
          >
            <RefreshCw  />
          </button>*/}
      </div>
      <Button onClick={handleAuthenticate} loading={loading}>
        Authenticate
      </Button>
    </SetupFrame>
  );
}
