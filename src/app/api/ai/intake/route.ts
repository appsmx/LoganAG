import { NextRequest, NextResponse } from "next/server";
import { proposeGraphFromText } from "@/lib/ai-intake";
import { intakeSchema } from "@/lib/validation";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/ai/intake — DEC-004: alta por lenguaje natural.
 * Recibe una descripción libre y devuelve un grafo PROPUESTO (no persiste nada).
 * El usuario debe confirmarlo luego vía /api/ai/confirm.
 */
export async function POST(req: NextRequest) {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await proposeGraphFromText(parsed.data.description);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  // disclosure de IA en la respuesta
  return NextResponse.json({ proposal: result.graph, aiDisclosure: true });
}
