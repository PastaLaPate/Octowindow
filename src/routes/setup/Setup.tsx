import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";

import type { OctoprintNode } from "@/lib/octoprint/Octoprint";

import Authorization from "./Authorization";
import NodeDiscovery from "./NodeDiscovery";
import WelcomeAnimation from "./WelcomeAnim";

const SetupState = {
  Welcome: "welcome",
  NodeDiscovery: "nodeDiscovery",
  Authorization: "authorization",
  Configuration: "configuration",
} as const;

type SetupState = (typeof SetupState)[keyof typeof SetupState];

type SetupProps = {
  initialState?: SetupState;
  children?: React.ReactNode;
  onCompleted?: () => void;
};

export default function Setup(props: SetupProps) {
  const { initialState = SetupState.Welcome, children, onCompleted } = props;
  const [currentState, setCurrentState] = useState<SetupState>(initialState);
  const [node, setNode] = useState<OctoprintNode>();

  const navigate = useNavigate();
  let content: React.ReactNode = null;
  if (currentState === SetupState.Welcome) {
    content = (
      <WelcomeAnimation
        onFinish={() => setCurrentState(SetupState.NodeDiscovery)}
      />
    );
  } else if (currentState === SetupState.NodeDiscovery) {
    content = (
      <NodeDiscovery
        nodeSelected={(nodeInfo, octoprintNode) => {
          setNode(octoprintNode);
          setCurrentState(SetupState.Authorization);
        }}
      />
    );
  } else if (currentState === SetupState.Authorization) {
    content = node ? (
      <Authorization
        node={node}
        onSuccess={() => setCurrentState(SetupState.Configuration)}
      />
    ) : null;
  } else if (currentState === SetupState.Configuration) {
    content = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h2 className="mb-4 text-2xl">Configuration</h2>
        <button
          className="rounded bg-green-500 px-4 py-2 text-white"
          onClick={() => navigate("/app")}
        >
          Finish Setup
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentState}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {content}
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
