import { StoreManager, type OctoprintNode } from "@/lib/octoprint/Octoprint";
import SetupFrame from "./SetupFrame";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

type AuthorizationProps = {
  node: OctoprintNode;
  onSuccess?: (apiKey: string) => void;
};

export default function Authorization({ node, onSuccess }: AuthorizationProps) {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAuthenticate = async () => {
    setLoading(true);
    abortControllerRef.current = new AbortController();
    try {
      const apiKey = await node.authenticate(abortControllerRef.current.signal);
      node.saveToStore(new StoreManager());
      onSuccess?.(apiKey);
    } catch (e) {
      // handle error or abort
      console.error("Authentication failed:", e);
    } finally {
      console.log("Authentication process completed.");
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    // Optionally, reset error state here
  };

  return (
    <SetupFrame
      key={"authorization"}
      className="flex flex-col items-center justify-center"
    >
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold">Authentication</h1>
      </div>
      <Button onClick={handleAuthenticate} loading={loading}>
        Authenticate
      </Button>
      <Button className="mt-5" variant="text" onClick={handleRetry}>
        Retry
      </Button>
    </SetupFrame>
  );
}
