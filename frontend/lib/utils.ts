import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility to merge Tailwind classes
 * Handles conflicts and removes duplicates
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
