import { motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  OctoprintNode,
  type OctoprintNodeType,
} from "@/lib/octoprint/Octoprint";
import ControlledInput from "@/components/ControlledInput";
import { Button } from "@/components/ui/button";

import SetupFrame from "./SetupFrame";

type NodeDiscoveryProps = {
  nodeSelected: (nodeInfos: OctoprintNodeType, node: OctoprintNode) => void;
};

export default function NodeDiscovery({ nodeSelected }: NodeDiscoveryProps) {
  const [loading, setLoading] = useState(false);
  const [nodeUrl, setNodeUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close keyboard if click is outside input and keyboard
  useEffect(() => {
    if (!isKeyboardVisible) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const input = inputRef.current;
      const keyboard = document.querySelector(".keyboard-wrapper");
      if (
        input &&
        !input.contains(target) &&
        keyboard &&
        !keyboard.contains(target)
      ) {
        setIsKeyboardVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isKeyboardVisible]);

  useEffect(() => {
    if (isKeyboardVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isKeyboardVisible]);

  const verifyNodeUrl = async (url: string) => {
    setLoading(true);
    setErrorMsg(null);
    if (!url || !url.startsWith("http://")) {
      setErrorMsg("Please enter a valid OctoPrint Node URL.");
      setLoading(false);
      return;
    }
    try {
      const nodeType = {
        url,
        version: "unknown",
      } as OctoprintNodeType;
      const node = new OctoprintNode(nodeType);
      await node.verifyNode();
      nodeSelected(nodeType, node);
    } catch (error) {
      setErrorMsg(
        "Invalid OctoPrint Node URL. Please try again. Tip : Instead of https use http if you are using a self-certified certificate.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SetupFrame key={"node-discovery"}>
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <h1 className="text-2xl font-bold sm:text-4xl">OctoPrint Nodes</h1>
      </div>
      <motion.div
        initial={{ height: 0, overflow: "hidden" }}
        animate={{ height: errorMsg ? "auto" : 0 }}
        exit={{ height: 0, overflow: "hidden" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {errorMsg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mb-5 text-xl text-red-500"
          >
            {errorMsg}
          </motion.p>
        )}
      </motion.div>

      <div className="mb-4 w-full sm:mb-6">
        <ControlledInput
          value={nodeUrl}
          onChange={setNodeUrl}
          label="Node URL:"
          placeholder="http://octoprint.local"
          numeric={false}
        />
      </div>

      <div className="mt-auto flex justify-center">
        <Button
          variant="default"
          loading={loading}
          className="w-full py-3 text-base sm:w-auto sm:text-lg"
          onClick={() => verifyNodeUrl(nodeUrl)}
        >
          Continue
        </Button>
      </div>
    </SetupFrame>
  );
}
