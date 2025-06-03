import {
  InvalidNode,
  OctoprintNode,
  type OctoprintNodeType,
} from "@/lib/octoprint/Octoprint";
import { useCallback, useEffect, useState, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ControlledKeyboard from "@/Keyboard";
import React from "react";
import { Button } from "@/components/ui/button";

type NodeDiscoveryProps = {
  nodeSelected: (node: OctoprintNodeType) => void;
};

export default function NodeDiscovery({ nodeSelected }: NodeDiscoveryProps) {
  const [nodes, setNodes] = useState<OctoprintNodeType[]>([]);
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
    if (!url) {
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
      nodeSelected(nodeType);
    } catch (error) {
      setErrorMsg(
        "Invalid OctoPrint Node URL. Please try again. Tip : Instead of https use http if you are using a self-certified certificate."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="node-discovery"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 1 }}
        className="w-full max-w-xl mx-auto flex flex-col bg-gray-800 text-white p-4 sm:p-8 rounded-2xl shadow-lg overflow-y-auto"
        style={{ minHeight: "20vh" }}
        layout
      >
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold">OctoPrint Nodes</h1>
          {/*<button
            className="ml-2 p-3 rounded-full hover:bg-gray-700 active:bg-gray-600 transition"
            style={{ touchAction: "manipulation" }}
            aria-label="Refresh"
          >
            <RefreshCw  />
          </button>*/}
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

        <div className="mb-6 w-full">
          <label
            htmlFor="nodeUrl"
            className="block text-white text-lg sm:text-2xl font-bold mb-3"
          >
            Node URL:
          </label>
          <input
            ref={inputRef}
            type="text"
            id="nodeUrl"
            inputMode="url"
            autoComplete="off"
            className="shadow appearance-none border border-gray-600 rounded-xl w-full py-4 px-4 text-white bg-gray-900 text-lg sm:text-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              padding: "1rem 0.5rem 2rem 0.5rem",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex justify-end mb-2 pr-4">
              <button
                className="text-white text-2xl bg-gray-700 rounded-full px-4 py-1 active:bg-gray-600"
                style={{ touchAction: "manipulation" }}
                onClick={() => setIsKeyboardVisible(false)}
                aria-label="Close Keyboard"
              >
                ×
              </button>
            </div>
            <ControlledKeyboard setInput={setKeyboardInput} input={nodeUrl} />
          </motion.div>
        )}

        <div className="mt-auto flex justify-center">
          <Button loading={loading} onClick={() => verifyNodeUrl(nodeUrl)} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
