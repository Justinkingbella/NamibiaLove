import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

export function formatChatTime(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return format(parsedDate, 'h:mm a');
}

export function formatEventDate(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return format(parsedDate, 'EEE, MMM d • h:mm a');
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getDistanceText(distance?: number): string {
  if (!distance) return '';
  return `${distance}km away`;
}
