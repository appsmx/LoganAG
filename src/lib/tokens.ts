// Utilidades de tokens para enlaces mágicos y sesiones (DEC-010).
// Se generan tokens aleatorios y se almacena SOLO su hash SHA-256 en la BD;
// el token en claro viaja al usuario (en el enlace o la cookie) una sola vez.

import { randomBytes, createHash } from "crypto";

/** Genera un token opaco en base64url. */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** Hash determinista para almacenar/buscar sin exponer el token en claro. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutos
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
export const SESSION_COOKIE = "loganag_session";
