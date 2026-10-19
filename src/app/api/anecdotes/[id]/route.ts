import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** DELETE /api/anecdotes/[id] — elimina una anécdota (rol editor). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  // la anécdota debe pertenecer a una persona del árbol activo
  const anecdote = await prisma.anecdote.findUnique({
    where: { id },
    include: { person: { select: { treeId: true } } },
  });
  if (!anecdote || anecdote.person.treeId !== ctx.treeId) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  await prisma.anecdote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
