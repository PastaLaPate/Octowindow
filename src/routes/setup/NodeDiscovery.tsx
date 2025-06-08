import {
  OctoprintNode,
  type OctoprintNodeType,
} from "@/lib/octoprint/Octoprint";
import { useCallback, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import ControlledKeyboard from "@/Keyboard";
import React from "react";
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

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNodeUrl(event.target.value);
    },
    []
  );

  const handleInputFocus = () => {
    setIsKeyboardVisible(true);
  };

  useEffect(() => {
    if (isKeyboardVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isKeyboardVisible]);

  const setKeyboardInput = (input: string) => {
    setNodeUrl(input);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

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
        "Invalid OctoPrint Node URL. Please try again. Tip : Instead of https use http if you are using a self-certified certificate."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SetupFrame key={"node-discovery"}>
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-4xl font-bold">OctoPrint Nodes</h1>
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
            className="text-red-500 mb-5 text-xl"
          >
            {errorMsg}
          </motion.p>
        )}
      </motion.div>

      <div className="mb-4 sm:mb-6 w-full">
        <label
          htmlFor="nodeUrl"
          className="block text-white text-base sm:text-lg font-bold mb-2 sm:mb-3"
        >
          Node URL:
        </label>
        <input
          ref={inputRef}
          type="text"
          id="nodeUrl"
          inputMode="url"
          autoComplete="off"
          className="shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-900 text-base sm:text-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={nodeUrl}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="http://octoprint.local"
        />
      </div>

      {isKeyboardVisible && (
        <motion.div
          className="keyboard-wrapper"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 50,
            background: "#1f2937",
            borderTopLeftRadius: "1.5rem",
            borderTopRightRadius: "1.5rem",
            padding: "1rem 0.5rem .5rem 0.5rem",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
          }}
        >
          <ControlledKeyboard
            setInput={setKeyboardInput}
            input={nodeUrl}
            close={() => setIsKeyboardVisible(false)}
          />
        </motion.div>
      )}

      <div className="mt-auto flex justify-center">
        <Button
          variant="default"
          loading={loading}
          className="w-full sm:w-auto py-3 text-base sm:text-lg"
          onClick={() => verifyNodeUrl(nodeUrl)}
        >
          Continue
        </Button>
      </div>
    </SetupFrame>
  );
}
