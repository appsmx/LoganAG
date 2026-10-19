import { NextResponse } from "next/server";
import { getTreeGraph } from "@/lib/tree-service";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/tree — grafo completo del árbol activo del usuario autenticado. */
export async function GET() {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  try {
    const graph = await getTreeGraph(ctx.treeId);
    return NextResponse.json({ treeId: ctx.treeId, access: ctx.access, ...graph });
  } catch {
    return NextResponse.json({ error: "No se pudo cargar el árbol." }, { status: 500 });
  }
}
