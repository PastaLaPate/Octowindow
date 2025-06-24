import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeIn" },
  }),
};

export function AnimationLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();

  // PUSH = forward (right to left), POP = backward (left to right)
  const direction = navigationType === "POP" ? -1 : 1;

  return (
    <motion.div
      key={location.key}
      custom={direction}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ position: "absolute", width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
