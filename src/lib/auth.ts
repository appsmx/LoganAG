// Autenticación por enlace mágico (DEC-010).
// Flujo:
//   1. requestMagicLink(email) → crea MagicLink (guarda hash) y envía correo.
//   2. consumeMagicLink(token) → valida, marca usado, crea User si no existe,
//      crea Session y devuelve el token de sesión para la cookie.
//   3. getCurrentUser() → lee la cookie, valida la Session, devuelve el usuario.
//   4. logout() → borra la Session y la cookie.

import { cookies } from "next/headers";
import { prisma } from "./prisma";
import {
  generateToken,
  hashToken,
  MAGIC_LINK_TTL_MS,
  SESSION_TTL_MS,
  SESSION_COOKIE,
} from "./tokens";
import { sendMail, magicLinkEmail } from "./mailer";

function appUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

export interface RequestLinkResult {
  ok: true;
  /** Presente solo en modo desarrollo (sin Brevo), para pruebas. */
  devLink?: string;
}

/** Paso 1: genera y envía un enlace mágico al correo. */
export async function requestMagicLink(
  emailRaw: string
): Promise<RequestLinkResult> {
  const email = emailRaw.trim().toLowerCase();
  const token = generateToken();
  const tokenHash = hashToken(token);

  await prisma.magicLink.create({
    data: {
      email,
      tokenHash,
      expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
    },
  });

  const link = `${appUrl()}/api/auth/verify?token=${token}`;
  const { html, text } = magicLinkEmail(link);
  const result = await sendMail({
    to: email,
    subject: "Tu enlace para entrar a LoganAG 🌳",
    html,
    text,
  });

  // En desarrollo (sin Brevo) devolvemos el enlace para poder probar.
  return result.delivered ? { ok: true } : { ok: true, devLink: link };
}

export interface ConsumeResult {
  ok: boolean;
  sessionToken?: string;
  error?: string;
}

/** Paso 2: consume el token del enlace y crea la sesión. */
export async function consumeMagicLink(token: string): Promise<ConsumeResult> {
  const tokenHash = hashToken(token);
  const link = await prisma.magicLink.findUnique({ where: { tokenHash } });

  if (!link) return { ok: false, error: "Enlace inválido." };
  if (link.usedAt) return { ok: false, error: "Este enlace ya se usó." };
  if (link.expiresAt < new Date())
    return { ok: false, error: "El enlace caducó. Solicita uno nuevo." };

  // Usuario (crear si es su primera vez)
  const user = await prisma.user.upsert({
    where: { email: link.email },
    update: {},
    create: { email: link.email },
  });

  // Marcar enlace como usado + crear sesión (transacción)
  const sessionToken = generateToken();
  await prisma.$transaction([
    prisma.magicLink.update({
      where: { id: link.id },
      data: { usedAt: new Date() },
    }),
    prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(sessionToken),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    }),
  ]);

  return { ok: true, sessionToken };
}

/** Escribe la cookie de sesión. */
export async function setSessionCookie(sessionToken: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
}

/** Paso 3: devuelve el usuario autenticado, o null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  };
}

/** Paso 4: cierra la sesión. */
export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session
      .deleteMany({ where: { tokenHash: hashToken(token) } })
      .catch(() => {});
  }
  jar.delete(SESSION_COOKIE);
}

/** Helper para rutas protegidas: lanza si no hay sesión. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("No autenticado.");
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
