import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names safely.
 * clsx handles conditional/array class inputs; twMerge resolves conflicts
 * between Tailwind utilities (e.g. `p-2` vs `p-4`) so the last one wins.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
