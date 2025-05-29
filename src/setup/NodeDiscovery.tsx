import type { OctoprintNodeType } from "@/lib/octoprint/Octoprint";
import { useCallback, useEffect, useState, useRef } from "react";
import { RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ControlledKeyboard from "@/Keyboard";
import React from "react";

type NodeDiscoveryProps = {
  nodeSelected: (node: OctoprintNodeType) => void;
};

export default function NodeDiscovery({ nodeSelected }: NodeDiscoveryProps) {
  const [nodes, setNodes] = useState<OctoprintNodeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [nodeUrl, setNodeUrl] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isClickInsideKeyboard = useRef(false);

  // Track click source
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".keyboard-wrapper")) {
        isClickInsideKeyboard.current = true;
      } else {
        isClickInsideKeyboard.current = false;
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNodeUrl(event.target.value);
    },
    []
  );

  const handleInputFocus = () => {
    setIsKeyboardVisible(true);
  };

  const handleInputBlur = () => {
    if (!isClickInsideKeyboard.current) {
      setIsKeyboardVisible(false);
    }

    // Clear the flag in the next event loop
    setTimeout(() => {
      isClickInsideKeyboard.current = false;
    }, 0);
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

  return (
    <AnimatePresence>
      <motion.div
        key="node-discovery"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center justify-center bg-gray-800 text-white p-4 rounded-2xl"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-2xl font-bold">OctoPrint Nodes</h1>
          <div className="ml-2 p-2 rounded hover:bg-gray-700 transition">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </div>
        </div>

        <div className="mb-4 w-full">
          <label
            htmlFor="nodeUrl"
            className="block text-white text-sm font-bold mb-2"
          >
            Node URL:
          </label>
          <input
            ref={inputRef}
            type="text"
            id="nodeUrl"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={nodeUrl}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
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
            }}
          >
            <ControlledKeyboard setInput={setKeyboardInput} />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
