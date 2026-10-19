import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDate } from "@/lib/tree-service";
import { anecdoteCreateSchema } from "@/lib/validation";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/persons/[id]/anecdotes — anécdotas de una persona. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  const person = await prisma.person.findFirst({
    where: { id, treeId: ctx.treeId },
  });
  if (!person) {
    return NextResponse.json(
      { error: "Persona no encontrada." },
      { status: 404 }
    );
  }

  const anecdotes = await prisma.anecdote.findMany({
    where: { personId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ anecdotes });
}

/** POST /api/persons/[id]/anecdotes — agrega una anécdota (rol editor). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  const person = await prisma.person.findFirst({
    where: { id, treeId: ctx.treeId },
  });
  if (!person) {
    return NextResponse.json(
      { error: "Persona no encontrada." },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = anecdoteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const anecdote = await prisma.anecdote.create({
    data: {
      personId: id,
      title: d.title,
      body: d.body,
      type: d.type,
      date: parseDate(d.date),
    },
  });
  return NextResponse.json({ anecdote }, { status: 201 });
}
