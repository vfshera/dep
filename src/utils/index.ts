import { twMerge, type ClassNameValue } from "tailwind-merge";

export function cn(...classes: ClassNameValue[]) {
  return twMerge(classes);
}
