import { NextResponse } from "next/server";
import { getOrCreateDemoTree, getTreeGraph } from "@/lib/tree-service";

export const dynamic = "force-dynamic";

/** GET /api/tree — grafo completo del árbol demo. */
export async function GET() {
  try {
    const treeId = await getOrCreateDemoTree();
    const graph = await getTreeGraph(treeId);
    return NextResponse.json({ treeId, ...graph });
  } catch (err) {
    return NextResponse.json(
      { error: "No se pudo cargar el árbol." },
      { status: 500 }
    );
  }
}
