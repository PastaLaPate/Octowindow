import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

export default function SetupFrame({
  children,
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 1 }}
        className={cn(
          // Responsive: full width, less padding, smaller radius on small screens
          "mx-auto flex w-full max-w-xl flex-col overflow-y-auto rounded-lg bg-slate-800 p-2 text-white shadow-lg sm:rounded-2xl sm:p-4 md:p-8",
          "max-h-[100dvh] min-h-[40vh] sm:max-h-[90vh]",
          className
        )}
        style={{
          minHeight: "40vh",
          maxHeight: "100dvh",
        }}
        layout
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
