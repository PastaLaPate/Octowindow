import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useLocation } from "react-router";

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  type: "tween",
  ease: "linear",
  duration: 1,
};

export const AnimationLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
