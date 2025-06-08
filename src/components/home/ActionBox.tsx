import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";
import { Settings, type LucideProps } from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router";

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
        "flex flex-col gap-4 relative flex-[1_0_20%] m-5 justify-center items-center bg-gray-800 w-full h-full",
        className
      )}
      onClick={() => navigate(to)}
    >
      <div className="h-2/6 w-2/6">
        <Icon className="w-full h-full" />
      </div>
      <p className="text-2xl font-bold">{label}</p>
      <div className={cn("absolute bottom-0 w-full h-0.5", color)} />
    </div>
  );
}
