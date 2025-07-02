import { defineStepper } from "@stepperize/react";
import { CheckCircle, CircleX, FileText, Printer, Spool } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import type { Print } from "@/lib/octoprint/apis/FileAPI";
import type { FilamentSpool } from "@/lib/octoprint/apis/SpoolManager";
import { cn, truncate } from "@/lib/utils";

import { Dialog, DialogContent } from "../ui/dialog";

//TODO: Make the currently selected spool selected by default before new release + select in spool page

// Stepper definition
const stepper = defineStepper(
  { id: "file-confirm", label: "File", icon: FileText },
  { id: "spool-select", label: "Spool", icon: Spool },
  { id: "print-confirm", label: "Confirm", icon: Printer },
  { id: "success", label: "Success", icon: CheckCircle }
);

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 500 : -500, opacity: 0 }),
};

const DemoSection = ({
  file,
  spools,
  onPrint,
  className,
  setOpen,
}: {
  file: Print;
  spools: FilamentSpool[];
  onPrint: (spool: FilamentSpool) => Promise<void>;
  className?: string;
  setOpen: (open: boolean) => void;
}) => {
  return (
    <stepper.Scoped>
      <section id="demo" className={cn("relative border-none bg-none px-4 sm:px-6 lg:px-8", className)}>
        <DemoContent file={file} spools={spools} onPrint={onPrint} setOpen={setOpen} />
      </section>
    </stepper.Scoped>
  );
};

const DemoContent = ({
  file,
  spools,
  onPrint,
  setOpen,
}: {
  file: Print;
  spools: FilamentSpool[];
  onPrint: (spool: FilamentSpool) => Promise<void>;
  setOpen: (open: boolean) => void;
}) => {
  const methods = stepper.useStepper();
  const [selectedSpool, setSelectedSpool] = React.useState<FilamentSpool | null>(null);
  const [printing, setPrinting] = React.useState(false);
  const [error, setError] = React.useState<Error>();

  // Step 1: File confirmation
  const FileStep = () => (
    <motion.div
      key="file-confirm"
      custom={methods.current.id}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <h3 className="text-gray-12 mb-4 text-xl font-semibold">File Confirmation</h3>
      <div className="flex items-center gap-4 md:flex-row lg:flex-col">
        {file.thumbnail && (
          <img
            src={file.thumbnail}
            alt="thumbnail"
            className="h-32 w-32 rounded-lg border border-gray-300 object-cover"
          />
        )}
        <div className="flex w-full flex-col gap-2">
          <div>
            <span className="font-bold">Name:</span> {file.display}
          </div>
          <div>
            <span className="font-bold">Path:</span> {file.path}
          </div>
          <div>
            <span className="font-bold">Size:</span> {file.size}
          </div>
          <div>
            <span className="font-bold">Origin:</span> {file.origin}
          </div>
        </div>
        <button
          className="mt-4 rounded-md bg-blue-600 px-6 py-2 font-bold text-white shadow transition-all hover:bg-blue-700 active:bg-blue-800"
          onClick={methods.next}
        >
          Confirm
        </button>
      </div>
    </motion.div>
  );

  // Step 2: Spool selection
  const SpoolStep = () => (
    <motion.div
      key="spool-select"
      className="flex max-h-2/4 flex-1 flex-col"
      custom={methods.current.id}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <h3 className="text-gray-12 text-xl font-semibold md:mb-2 lg:mb-4">Select Filament Spool</h3>
      <div className="flex flex-1 flex-col overflow-y-auto md:gap-1.5 lg:gap-3">
        {spools.length === 0 && <div className="text-slate-400">No spools available.</div>}
        {spools.map((spool) => (
          <button
            key={spool.id}
            className={cn(
              "flex items-center gap-4 rounded-lg border-2 px-4 py-2 transition-all",
              selectedSpool?.id === spool.id
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900"
                : "border-transparent bg-slate-800 hover:border-blue-400"
            )}
            onClick={() => setSelectedSpool(spool)}
          >
            <span
              className="inline-block h-6 w-6 rounded-full border-2 border-slate-400"
              style={{ background: spool.color }}
            />
            <span className="font-bold">{spool.displayName}</span>
            <span className="ml-auto text-xs text-slate-400">{spool.material}</span>
            <span className="ml-2 text-xs text-slate-400">{spool.vendor}</span>
          </button>
        ))}
      </div>
      <button
        className="rounded-md bg-blue-600 px-6 py-2 font-bold text-white shadow transition-all hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 md:mt-2 lg:mt-6"
        onClick={methods.next}
        disabled={!selectedSpool}
      >
        Confirm Spool
      </button>
    </motion.div>
  );

  const PrintThumbnail = ({ file }: { file: Print }) => {
    return (
      <img
        src={file.thumbnail}
        alt="thumbnail"
        className="h-16 w-16 rounded-lg border border-gray-300 object-cover lg:h-32 lg:w-32"
      />
    );
  };

  const PrintInfos = ({ file }: { file: Print }) => {
    return (
      <div className="flex w-full flex-col gap-1 text-xs md:text-base">
        <div>
          <span className="font-bold">Name:</span> {file.display}
        </div>
        <div>
          <span className="font-bold">Path:</span> {truncate(file.path, 50, false)}
        </div>
        <div>
          <span className="font-bold">Size:</span> {file.size}
        </div>
        <div>
          <span className="font-bold">Origin:</span> {file.origin}
        </div>
      </div>
    );
  };

  const SpoolInfos = ({ selectedSpool }: { selectedSpool: FilamentSpool }) => {
    return (
      <div className="mt-2 flex w-full flex-col gap-1 rounded-lg border-2 border-blue-600 bg-blue-50 p-2 text-xs md:mt-0 md:p-3 md:text-base dark:bg-blue-900">
        <div>
          <span className="font-bold">Spool:</span> {selectedSpool.displayName}
        </div>
        <div>
          <span className="font-bold">Material:</span> {selectedSpool.material}
        </div>
        <div>
          <span className="font-bold">Color:</span>{" "}
          <span
            className="inline-block h-3 w-3 rounded-full border border-slate-400 align-middle md:h-4 md:w-4"
            style={{ background: selectedSpool.color }}
          />
        </div>
        <div>
          <span className="font-bold">Vendor:</span> {selectedSpool.vendor}
        </div>
      </div>
    );
  };

  // Step 3: Print confirmation
  const PrintStep = () => (
    <motion.div
      key="print-confirm"
      custom={methods.current.id}
      variants={slideVariants}
      initial="enter"
      className="flex flex-col md:gap-2 lg:gap-4"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <h3 className="text-gray-12 text-base font-semibold md:text-xl">Print Confirmation</h3>
      <div className="flex flex-col items-center gap-2">
        {window.innerWidth > 1024 ? (
          <>
            {file.thumbnail && <PrintThumbnail file={file} />}
            <div className="flex w-full flex-col gap-2">
              <PrintInfos file={file} />
              {selectedSpool && <SpoolInfos selectedSpool={selectedSpool} />}
            </div>
          </>
        ) : (
          <div className="flex w-full flex-row items-center justify-center gap-2">
            <PrintInfos file={file} />
            {file.thumbnail && <PrintThumbnail file={file} />}
            {selectedSpool && <SpoolInfos selectedSpool={selectedSpool} />}
          </div>
        )}
        <button
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white shadow transition-all hover:bg-green-700 active:bg-green-800 disabled:opacity-50 md:text-base"
          onClick={async () => {
            setPrinting(true);
            try {
              await onPrint(selectedSpool!);
            } catch (error) {
              if (error instanceof Error) {
                setError(error);
              }
            }
            setPrinting(false);
            methods.next();
          }}
          disabled={!selectedSpool || printing}
        >
          {printing ? "Starting print..." : "Print"}
        </button>
      </div>
    </motion.div>
  );
  // Step 4: Success
  const SuccessStep = ({ setOpen }: { setOpen: (open: boolean) => void }) => (
    <motion.div
      key="success"
      custom={methods.current.id}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="py-10 text-center"
    >
      <motion.div
        className="bg-green-11 mx-auto mb-6 flex size-20 items-center justify-center rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
      >
        {error ? <CircleX className="size-10 text-red-500" /> : <CheckCircle className="size-10 text-green-600" />}
      </motion.div>
      <motion.h3
        className="text-gray-12 mb-2 text-2xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {error ? "An error has occured while starting print..." : "Success!"}
      </motion.h3>
      <motion.p
        className="text-gray-12 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {error ? error.message : "Your print has started successfully."}
      </motion.p>
      <motion.button
        type="button"
        onClick={() => {
          methods.reset();
          setSelectedSpool(null);
          if (!error) {
            setOpen(false);
          }
        }}
        className={cn(
          "rounded-md px-4 py-2 transition-colors",
          error ? "bg-red-800 hover:bg-red-600" : "bg-green-600 hover:bg-green-400"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {error ? "Start Over" : "Finish"}
      </motion.button>
    </motion.div>
  );

  return (
    <div className="relative z-10 mx-auto h-full max-w-5xl border-none">
      <motion.div
        className="h-full overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
          type: "spring",
          stiffness: 50,
        }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <StepperHeader methods={methods} isComplete={methods.isLast} />
        <div className="flex h-full flex-col overflow-y-auto md:p-1.5 lg:p-8">
          <AnimatePresence mode="wait" custom={methods.current.id}>
            {methods.when("file-confirm", FileStep)}
            {methods.when("spool-select", SpoolStep)}
            {methods.when("print-confirm", PrintStep)}
            {methods.when("success", () => (
              <SuccessStep setOpen={setOpen} />
            ))}
          </AnimatePresence>
          <div className="flex justify-between md:mt-3 lg:mt-8">
            {!methods.isFirst && !methods.isLast && (
              <motion.button
                type="button"
                onClick={methods.prev}
                className="border-gray-11 text-gray-12 hover:bg-gray-12 rounded-md border px-4 py-2 transition-colors"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(99, 102, 241, 0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
              >
                Back
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
const StepperHeader = ({
  methods,
  isComplete,
}: {
  methods: ReturnType<typeof stepper.useStepper>;
  isComplete: boolean;
}) => {
  const currentIndex = methods.all.findIndex((step: any) => step.id === methods.current.id);

  return (
    <nav className="bg-gray-4/30 md:p-1.5 lg:p-8">
      <ol className="relative flex items-center justify-between">
        <div className="absolute top-5 right-4 left-4 z-0 h-0.5 bg-gray-700">
          <motion.div
            className="h-full bg-indigo-600"
            initial={{ width: "0%" }}
            animate={{
              width:
                methods.current.id === methods.all[methods.all.length - 1].id || isComplete
                  ? "100%"
                  : `${(currentIndex / (methods.all.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
        {methods.all.map((step: any, index: number) => {
          const isActive = step.id === methods.current.id;
          // Only allow navigation to previous steps (not future steps)
          const canGoTo = index <= currentIndex || isComplete;
          return (
            <motion.li
              key={step.id}
              className={cn("relative z-10 flex flex-shrink-0 flex-col items-center", !canGoTo && "cursor-not-allowed")}
              onClick={() => {
                if (canGoTo) methods.goTo(step.id);
              }}
              whileHover={canGoTo && !isComplete ? { scale: 1.05 } : {}}
              whileTap={canGoTo && !isComplete ? { scale: 0.95 } : {}}
            >
              <motion.div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  isActive
                    ? "bg-green-600 text-green-100"
                    : index <= currentIndex
                      ? "bg-indigo-600 text-indigo-100"
                      : "bg-gray-800 text-gray-100"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 10,
                  delay: 0.1 * index,
                }}
              >
                {index < currentIndex || isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="size-5" />
                  </motion.div>
                ) : (
                  <step.icon className="size-5" />
                )}
              </motion.div>
              <motion.span
                className={cn(
                  "mt-2 hidden text-xs sm:block",
                  isActive ? "text-indigo-11 font-medium" : !isComplete && "text-gray-11"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + 0.1 * index }}
              >
                {step.label}
              </motion.span>
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
};

export default function StartPrintDialog({
  file,
  spools,
  open,
  setOpen,
  onPrint,
}: {
  file: Print;
  open: boolean;
  setOpen: (open: boolean) => void;
  spools: FilamentSpool[];
  onPrint: (spool: FilamentSpool) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-2/3 max-w-none p-0 md:h-[80vh] lg:h-auto" style={{ width: "80vw", maxWidth: "none" }}>
        <DemoSection file={file} spools={spools} onPrint={onPrint} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
