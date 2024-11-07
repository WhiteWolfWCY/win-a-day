import { GoalPriority } from "@/db/schema";
import { clsx, type ClassValue } from "clsx"
import { Metadata } from "next";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function constructMetadata({
  title = "Win A Day",
  description = "The best habit tracker out there!",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@WhiteWolf",
    },
    icons,
    metadataBase: new URL("https://win-a-day.vercel.app/"),
  };
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
