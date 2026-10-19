import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — verifica el estado del servicio.
 * Comprueba conectividad con la BD y si el proxy LLM está configurado.
 * No expone secretos; solo booleanos y estado.
 */
export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Base de datos
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
    healthy = false;
  }

  // Configuración del proxy LLM (no se llama; solo se verifica que exista)
  checks.llm =
    process.env.LOGAN_LLM_URL && process.env.LOGAN_LLM_SECRET
      ? "configured"
      : "not_configured";

  // Correo (opcional en desarrollo)
  checks.mailer = process.env.BREVO_API_KEY ? "configured" : "dev_mode";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      service: "LoganAG",
      time: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
