import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = {
  onFinish: () => void;
};

export default function WelcomeAnimation({ onFinish }: Props) {
  const [showText, setShowText] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 2500); // Show text for 2.5 seconds

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3500); // Wait a bit before continuing

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <AnimatePresence>
        {showText && (
          <motion.h1
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="text-4xl font-bold text-white"
          >
            Welcome to OctoWindow
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}
