import type { ClassValue } from "clsx";
import { Settings, type LucideProps } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";

export default function ActionBox({
  className = "",
  color = "bg-lime-500",
  icon = Settings,
  label = "Settings",
  to = "/app",
  onClick,
}: {
  className?: ClassValue;
  color?: ClassValue;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label?: string;
  to?: string;
  onClick?: () => void;
}) {
  const Icon = icon;
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        // Preheat-like style:
        "relative flex w-full flex-[1_0_20%] cursor-pointer flex-col items-center justify-between gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-lg transition hover:scale-105 hover:border-blue-500 focus:outline-none active:scale-100 sm:gap-2 sm:p-5",
        className
      )}
      onClick={() => (onClick ? onClick() : navigate(to))}
      tabIndex={0}
      role="button"
    >
      <div className="flex h-2/6 w-2/6 items-center justify-center sm:h-1/4 sm:w-1/4">
        <Icon className="h-full w-full" />
      </div>
      <p className="text-base font-bold text-blue-400 transition group-hover:text-blue-300 sm:text-base">
        {label}
      </p>
      {/* Bottom little colored bar*/}
      <div
        className={cn("absolute bottom-0 h-2 w-full rounded-b-2xl", color)}
      />
    </div>
  );
}
