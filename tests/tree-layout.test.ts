import { describe, it, expect } from "vitest";
import { computeLayout } from "@/lib/tree-layout";
import type { TreeGraph, PersonDTO } from "@/lib/types";

function person(id: string, firstName: string): PersonDTO {
  return {
    id,
    firstName,
    lastName: null,
    nickname: null,
    gender: "UNKNOWN",
    birthDate: null,
    birthPlace: null,
    deathDate: null,
    deathPlace: null,
    photoUrl: null,
    notes: null,
    isLiving: true,
  };
}

// Grafo de 3 generaciones:
//   abuelo + abuela (pareja) -> padre -> hijo
const graph: TreeGraph = {
  persons: [
    person("abuelo", "Abuelo"),
    person("abuela", "Abuela"),
    person("padre", "Padre"),
    person("hijo", "Hijo"),
  ],
  relationships: [
    { id: "r1", type: "PARTNER", personAId: "abuelo", personBId: "abuela" },
    { id: "r2", type: "PARENT_CHILD", personAId: "abuelo", personBId: "padre" },
    { id: "r3", type: "PARENT_CHILD", personAId: "abuela", personBId: "padre" },
    { id: "r4", type: "PARENT_CHILD", personAId: "padre", personBId: "hijo" },
  ],
};

describe("computeLayout (DEC-002: enfoque + contexto)", () => {
  it("devuelve layout vacío si la persona enfocada no existe", () => {
    const l = computeLayout(graph, { focusId: "fantasma" });
    expect(l.nodes).toHaveLength(0);
  });

  it("coloca a la persona enfocada en la generación 0", () => {
    const l = computeLayout(graph, { focusId: "padre" });
    const padre = l.nodes.find((n) => n.person.id === "padre");
    expect(padre?.generation).toBe(0);
  });

  it("ubica ancestros arriba (generación negativa) y descendientes abajo", () => {
    const l = computeLayout(graph, {
      focusId: "padre",
      ancestorDepth: 2,
      descendantDepth: 2,
    });
    const abuelo = l.nodes.find((n) => n.person.id === "abuelo");
    const hijo = l.nodes.find((n) => n.person.id === "hijo");
    expect(abuelo?.generation).toBe(-1);
    expect(hijo?.generation).toBe(1);
  });

  it("incluye a la pareja en la misma generación", () => {
    const l = computeLayout(graph, { focusId: "padre" });
    const abuelo = l.nodes.find((n) => n.person.id === "abuelo");
    const abuela = l.nodes.find((n) => n.person.id === "abuela");
    expect(abuelo?.generation).toBe(abuela?.generation);
  });

  it("respeta la profundidad: no muestra ancestros más allá del límite", () => {
    const l = computeLayout(graph, {
      focusId: "hijo",
      ancestorDepth: 1, // solo padres, no abuelos
      descendantDepth: 0,
    });
    expect(l.nodes.find((n) => n.person.id === "padre")).toBeDefined();
    expect(l.nodes.find((n) => n.person.id === "abuelo")).toBeUndefined();
  });

  it("al colapsar una persona, oculta a sus descendientes", () => {
    const l = computeLayout(graph, {
      focusId: "abuelo",
      descendantDepth: 3,
      collapsed: new Set(["padre"]),
    });
    // padre es visible, pero su hijo queda oculto por el colapso
    expect(l.nodes.find((n) => n.person.id === "padre")).toBeDefined();
    expect(l.nodes.find((n) => n.person.id === "hijo")).toBeUndefined();
  });

  it("marca hasHiddenChildren cuando una persona tiene hijos colapsados", () => {
    const l = computeLayout(graph, {
      focusId: "abuelo",
      descendantDepth: 3,
      collapsed: new Set(["padre"]),
    });
    const padre = l.nodes.find((n) => n.person.id === "padre");
    expect(padre?.hasHiddenChildren).toBe(true);
  });

  it("no duplica nodos aunque haya múltiples caminos", () => {
    const l = computeLayout(graph, { focusId: "padre" });
    const ids = l.nodes.map((n) => n.person.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
