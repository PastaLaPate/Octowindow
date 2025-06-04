import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

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
          "w-full max-w-xl mx-auto flex flex-col bg-gray-800 text-white p-4 sm:p-8 rounded-2xl shadow-lg overflow-y-auto",
          className
        )}
        style={{ minHeight: "20vh" }}
        layout
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
