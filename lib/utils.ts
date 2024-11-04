import { GoalPriority } from "@/db/schema";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriorityColorClass(priority: GoalPriority) {
  switch (priority) {
    case GoalPriority.LOW:
      return "text-info";
    case GoalPriority.MEDIUM:
      return "text-warning";
    case GoalPriority.HIGH:
      return "text-danger";
    default:
      return "text-foreground";
  }
}
