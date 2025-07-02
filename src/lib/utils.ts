import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
