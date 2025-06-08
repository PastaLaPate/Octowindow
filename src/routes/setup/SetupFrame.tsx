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
          // Responsive: full width, less padding, smaller radius on small screens
          "w-full max-w-xl mx-auto flex flex-col bg-gray-800 text-white p-2 sm:p-4 md:p-8 rounded-lg sm:rounded-2xl shadow-lg overflow-y-auto",
          "min-h-[40vh] max-h-[100dvh] sm:max-h-[90vh]",
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
