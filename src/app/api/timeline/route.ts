import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContext, isResponse } from "@/lib/api-helpers";
import { buildTimeline } from "@/lib/timeline";
import { fullName } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** GET /api/timeline — línea de tiempo del árbol activo (P2). */
export async function GET() {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  const persons = await prisma.person.findMany({
    where: { treeId: ctx.treeId },
    include: { anecdotes: true },
  });

  const timelinePersons = persons.map((p) => ({
    id: p.id,
    name: fullName(p),
    birthDate: p.birthDate?.toISOString() ?? null,
    deathDate: p.deathDate?.toISOString() ?? null,
    isLiving: p.isLiving,
  }));

  const anecdotes = persons.flatMap((p) =>
    p.anecdotes.map((a) => ({
      personId: p.id,
      personName: fullName(p),
      title: a.title,
      body: a.body,
      type: a.type,
      date: a.date?.toISOString() ?? null,
    }))
  );

  const events = buildTimeline(timelinePersons, anecdotes);
  return NextResponse.json({ events });
}
