// Construcción de la línea de tiempo familiar (backlog P2).
// Función pura: toma personas + anécdotas y produce una lista de eventos ordenada
// cronológicamente. Es testeable sin BD.

export type TimelineEventType =
  "BIRTH" | "DEATH" | "MILESTONE" | "STORY" | "KEY_POINT";

export interface TimelineEvent {
  type: TimelineEventType;
  date: string; // ISO
  year: number;
  personId: string;
  personName: string;
  title: string;
  detail?: string;
}

export interface TimelinePerson {
  id: string;
  name: string;
  birthDate: string | null;
  deathDate: string | null;
  isLiving: boolean;
}

export interface TimelineAnecdote {
  personId: string;
  personName: string;
  title: string;
  body: string;
  type: "STORY" | "MILESTONE" | "KEY_POINT";
  date: string | null;
}

/**
 * Construye los eventos de la línea de tiempo, ordenados de más antiguo a más
 * reciente. Ignora entradas sin fecha (no se puede ubicar en el tiempo).
 */
export function buildTimeline(
  persons: TimelinePerson[],
  anecdotes: TimelineAnecdote[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const p of persons) {
    if (p.birthDate) {
      events.push({
        type: "BIRTH",
        date: p.birthDate,
        year: new Date(p.birthDate).getFullYear(),
        personId: p.id,
        personName: p.name,
        title: `Nació ${p.name}`,
      });
    }
    if (!p.isLiving && p.deathDate) {
      events.push({
        type: "DEATH",
        date: p.deathDate,
        year: new Date(p.deathDate).getFullYear(),
        personId: p.id,
        personName: p.name,
        title: `Falleció ${p.name}`,
      });
    }
  }

  for (const a of anecdotes) {
    if (!a.date) continue; // sin fecha no se ubica en la línea
    events.push({
      type: a.type,
      date: a.date,
      year: new Date(a.date).getFullYear(),
      personId: a.personId,
      personName: a.personName,
      title: a.title,
      detail: a.body,
    });
  }

  events.sort(
    (x, y) => new Date(x.date).getTime() - new Date(y.date).getTime()
  );
  return events;
}
