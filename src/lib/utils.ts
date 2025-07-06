import { clsx, type ClassValue } from "clsx";
import { t } from "i18next";
import { twMerge } from "tailwind-merge";

import type { PrinterTarget } from "./octoprint/Octoprint";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTargetLabel(target: PrinterTarget) {
  return t(`printer_targets.${target}`);
}

export function truncate(
  str: String,
  x: number,
  useWordBoundary = false
): String {
  if (str.length <= x) return str;
  const subStr = str.slice(0, x - 1);
  return (
    (useWordBoundary ? subStr.slice(0, subStr.lastIndexOf(" ")) : subStr) + "…"
  );
}
