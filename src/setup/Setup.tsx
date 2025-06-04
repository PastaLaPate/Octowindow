import { useState } from "react";
import WelcomeAnimation from "./WelcomeAnim";
import { AnimatePresence, motion } from "framer-motion";
import NodeDiscovery from "./NodeDiscovery";
import Authorization from "./Authorization";
import type {
  OctoprintNode,
  OctoprintNodeType,
} from "@/lib/octoprint/Octoprint";

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
};

export default function Setup(props: SetupProps) {
  const { initialState = SetupState.Welcome, children } = props;
  const [currentState, setCurrentState] = useState<SetupState>(initialState);
  const [nodeInfos, setNodeInfos] = useState<OctoprintNodeType>();
  const [node, setNode] = useState<OctoprintNode>();

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
          setNodeInfos(nodeInfo);
          setNode(octoprintNode);
          setCurrentState(SetupState.Authorization);
        }}
      />
    );
  } else if (currentState === SetupState.Authorization) {
    content = node ? <Authorization node={node} /> : null;
  } else if (currentState === SetupState.Configuration) {
    content = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <h2 className="text-2xl mb-4">Configuration</h2>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => setCurrentState(SetupState.Welcome)}
        >
          Finish Setup
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white">
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
