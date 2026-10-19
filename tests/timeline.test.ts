import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  type TimelinePerson,
  type TimelineAnecdote,
} from "@/lib/timeline";

const persons: TimelinePerson[] = [
  {
    id: "a",
    name: "Juan",
    birthDate: "1940-05-01T00:00:00.000Z",
    deathDate: "2010-03-01T00:00:00.000Z",
    isLiving: false,
  },
  {
    id: "b",
    name: "Sofía",
    birthDate: "1998-09-10T00:00:00.000Z",
    deathDate: null,
    isLiving: true,
  },
];

const anecdotes: TimelineAnecdote[] = [
  {
    personId: "a",
    personName: "Juan",
    title: "Fundó la tienda",
    body: "Abrió el negocio familiar.",
    type: "MILESTONE",
    date: "1965-01-01T00:00:00.000Z",
  },
  {
    personId: "a",
    personName: "Juan",
    title: "Anécdota sin fecha",
    body: "No se puede ubicar.",
    type: "STORY",
    date: null,
  },
];

describe("buildTimeline (P2)", () => {
  it("incluye nacimientos y defunciones", () => {
    const events = buildTimeline(persons, []);
    const types = events.map((e) => e.type);
    expect(types).toContain("BIRTH");
    expect(types).toContain("DEATH");
  });

  it("no genera defunción para personas vivas", () => {
    const events = buildTimeline(persons, []);
    const sofiaDeath = events.find(
      (e) => e.personId === "b" && e.type === "DEATH"
    );
    expect(sofiaDeath).toBeUndefined();
  });

  it("ordena los eventos cronológicamente", () => {
    const events = buildTimeline(persons, anecdotes);
    const years = events.map((e) => e.year);
    const sorted = [...years].sort((x, y) => x - y);
    expect(years).toEqual(sorted);
  });

  it("ignora anécdotas sin fecha", () => {
    const events = buildTimeline(persons, anecdotes);
    expect(
      events.find((e) => e.title === "Anécdota sin fecha")
    ).toBeUndefined();
  });

  it("incluye anécdotas con fecha como eventos", () => {
    const events = buildTimeline(persons, anecdotes);
    const milestone = events.find((e) => e.title === "Fundó la tienda");
    expect(milestone?.year).toBe(1965);
  });
});
