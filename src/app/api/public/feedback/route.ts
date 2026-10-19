import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Rate-limit simple en memoria: 3 envíos por minuto por IP (estándar LOGAN).
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

const schema = z.object({
  type: z.enum(["SUGERENCIA", "ERROR", "OTRO"]).default("SUGERENCIA"),
  message: z.string().min(3, "Escribe tu comentario").max(2000),
  name: z.string().max(120).optional().nullable(),
  email: z.string().email().max(160).optional().nullable().or(z.literal("")),
  // honeypot anti-spam: debe venir vacío (campo oculto "website")
  website: z.string().optional(),
});

/** POST /api/public/feedback — canal público de comentarios (estándar LOGAN). */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intenta en un minuto." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  // Honeypot: si viene relleno, es un bot. Respondemos OK silenciosamente.
  if (parsed.data.website && parsed.data.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { type, message, name, email } = parsed.data;
  await prisma.feedback.create({
    data: {
      type,
      message: message.trim(),
      name: name?.trim() || null,
      email: email && email.trim() !== "" ? email.trim() : null,
      source: "app",
    },
  });

  return NextResponse.json({ ok: true });
}
