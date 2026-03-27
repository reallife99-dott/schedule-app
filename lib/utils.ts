import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSlotDate(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, "M月d日(E)", { locale: ja });
}

export function formatSlotTime(startIso: string, endIso: string): string {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  return `${format(start, "HH:mm")}〜${format(end, "HH:mm")}`;
}

export function formatSlotFull(startIso: string, endIso: string): string {
  return `${formatSlotDate(startIso)} ${formatSlotTime(startIso, endIso)}`;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
