import type { ClassValue } from "clsx";
import { Settings, type LucideProps } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router";

import { cn } from "@/lib/utils";

export default function ActionBox({
  className = "",
  color = "bg-lime-500",
  icon = Settings,
  label = "Settings",
  to = "/app",
}: {
  className?: ClassValue;
  color?: ClassValue;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label?: string;
  to?: string;
}) {
  const Icon = icon;
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        "relative flex w-full flex-[1_0_20%] flex-col items-center justify-center gap-4 bg-slate-800 sm:h-24 lg:h-60",
        className,
      )}
      onClick={() => navigate(to)}
    >
      <div className="h-2/6 w-2/6">
        <Icon className="h-full w-full" />
      </div>
      <p className="text-2xl font-bold">{label}</p>
      <div className={cn("absolute bottom-0 h-0.5 w-full", color)} />
    </div>
  );
}
