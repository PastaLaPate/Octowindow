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
        "w-full flex justify-center items-center max-w-xs px-8 py-5 font-bold rounded-2xl text-2xl shadow-lg transition",
        loading && "opacity-50 cursor-not-allowed",
        variant === "destructive" || destructive
          ? "bg-red-600 text-white hover:bg-red-700 active:bg-red-800"
          : variant === "text"
          ? "bg-transparent shadow-none text-xl px-0 py-0 max-w-none rounded-none text-gray-300 underline hover:text-white active:text-gray-400 hover:bg-transparent active:bg-transparent"
          : "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900",
        className
      )}
      type="button"
      style={{ touchAction: "manipulation" }}
      disabled={loading}
      {...props}
    >
      {loading ? <RefreshCw className={`w-6 h-6 animate-spin`} /> : children}
    </button>
  );
}
