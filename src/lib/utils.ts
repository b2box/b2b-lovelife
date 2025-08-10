import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Slugify helper to create URL-friendly handles from titles
export function slugify(input: string): string {
  return (input || "")
    .toString()
    .normalize("NFD") // split accents
    .replace(/\p{Diacritic}+/gu, "") // remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanum -> dash
    .replace(/-{2,}/g, "-") // collapse dashes
    .replace(/^-+|-+$/g, ""); // trim dashes
}
