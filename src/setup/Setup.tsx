import { useState } from "react";
import WelcomeAnimation from "./WelcomeAnim";
import { AnimatePresence } from "framer-motion";
import NodeDiscovery from "./NodeDiscovery";

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
  const [currentState, setCurrentState] = useState<SetupState>(
    SetupState.Welcome
  );

  return (
    <AnimatePresence>
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white">
        {currentState === SetupState.Welcome && (
          <WelcomeAnimation
            onFinish={() => {
              setCurrentState(SetupState.NodeDiscovery);
            }}
          />
        )}
        {currentState === SetupState.NodeDiscovery && (
          <NodeDiscovery
            nodeSelected={(node) => {
              setCurrentState(SetupState.Authorization);
            }}
          />
        )}
        {currentState === SetupState.Authorization && (
          <div>
            <h2 className="text-2xl mb-4">Authorization</h2>
            {/* Authorization logic goes here */}
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setCurrentState(SetupState.Configuration)}
            >
              Next
            </button>
          </div>
        )}
        {currentState === SetupState.Configuration && (
          <div>
            <h2 className="text-2xl mb-4">Configuration</h2>
            {/* Configuration logic goes here */}
            <button
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={() => setCurrentState(SetupState.Welcome)}
            >
              Finish Setup
            </button>
          </div>
        )}
        {children}
      </div>
    </AnimatePresence>
  );
}
