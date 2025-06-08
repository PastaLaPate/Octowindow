import { cn } from "@/lib/utils";

export default function ActionBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex-[1_0_20%] m-5 justify-center items-center bg-gray-800 w-full h-full",
        className
      )}
    >
      <p>a</p>
    </div>
  );
}
