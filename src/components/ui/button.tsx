import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  destructive?: boolean;
  children?: React.ReactNode;
};

export function Button({
  loading,
  destructive,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        `w-full flex justify-center items-center max-w-xs px-8 py-5 bg-blue-700 ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        } rounded-2xl text-2xl font-bold hover:bg-blue-800 active:bg-blue-900 transition shadow-lg`,
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
