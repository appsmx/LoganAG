import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestMagicLink } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email("Correo inválido.") });

/** POST /api/auth/request — envía un enlace mágico (DEC-010). */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }

  try {
    const result = await requestMagicLink(parsed.data.email);
    // No revelamos si el correo existe. Respuesta uniforme.
    return NextResponse.json({
      ok: true,
      message: "Si el correo es válido, enviamos un enlace para entrar.",
      // devLink solo aparece en desarrollo (sin Brevo), para pruebas locales.
      ...(result.devLink ? { devLink: result.devLink } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo generar el enlace." },
      { status: 500 }
    );
  }
}
