import * as React from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import type { ClassValue } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  destructive?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "destructive" | "text";
};

export function Button({
  loading,
  destructive,
  className,
  children,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "appearance-none",
        "flex w-full max-w-xs items-center justify-center rounded-2xl px-8 py-5 text-2xl font-bold shadow-lg transition",
        loading && "cursor-not-allowed opacity-50",
        variant === "destructive" || destructive
          ? "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
          : variant === "text"
            ? "max-w-none rounded-none bg-transparent px-0 py-0 text-xl text-slate-300 underline shadow-none hover:bg-transparent hover:text-white active:bg-transparent active:text-slate-400"
            : "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900",
        className,
      )}
      type="button"
      style={{ touchAction: "manipulation" }}
      disabled={loading}
      {...props}
    >
      {loading ? <RefreshCw className={`h-6 w-6 animate-spin`} /> : children}
    </button>
  );
}
