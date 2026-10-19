import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina clases de Tailwind de forma segura. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Escapa HTML para uso en correos u otros contextos no-React (estándar LOGAN). */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Nombre completo legible de una persona. */
export function fullName(p: { firstName: string; lastName?: string | null }): string {
  return [p.firstName, p.lastName].filter(Boolean).join(" ");
}
