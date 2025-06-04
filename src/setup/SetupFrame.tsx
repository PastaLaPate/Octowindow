import { AnimatePresence, motion } from "framer-motion";

export default function SetupFrame({
  children,
  ...props
}: {
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 1 }}
        className="w-full max-w-xl mx-auto flex flex-col bg-gray-800 text-white p-4 sm:p-8 rounded-2xl shadow-lg overflow-y-auto"
        style={{ minHeight: "20vh" }}
        layout
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
