// Motor de layout del árbol (DEC-002: visualización que no se satura).
//
// Estrategia "enfoque + contexto": a partir de una persona enfocada, se recorre el
// grafo por generaciones (ancestros hacia arriba, descendientes hacia abajo) hasta
// una profundidad limitada. Las ramas se pueden colapsar. Esto mantiene el lienzo
// legible aunque el árbol tenga cientos de personas.

import type { PersonDTO, RelationshipDTO, TreeGraph } from "./types";

export interface LayoutNode {
  person: PersonDTO;
  // coordenadas en unidades de grilla (se escalan en el render)
  col: number;
  row: number;
  generation: number; // 0 = persona enfocada, negativo = ancestros, positivo = descendientes
  partnerId: string | null;
  hasHiddenParents: boolean;
  hasHiddenChildren: boolean;
}

export interface LayoutEdge {
  fromId: string;
  toId: string;
  kind: "parent" | "partner";
}

export interface TreeLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  cols: number;
  rows: number;
}

export interface LayoutOptions {
  focusId: string;
  /** generaciones de ancestros a mostrar (hacia arriba) */
  ancestorDepth?: number;
  /** generaciones de descendientes a mostrar (hacia abajo) */
  descendantDepth?: number;
  /** ids de personas cuyas ramas (hijos) están colapsadas */
  collapsed?: Set<string>;
}

interface Indexes {
  personById: Map<string, PersonDTO>;
  parentsOf: Map<string, string[]>; // childId -> parentIds
  childrenOf: Map<string, string[]>; // parentId -> childIds
  partnersOf: Map<string, string[]>; // personId -> partnerIds
}

function buildIndexes(graph: TreeGraph): Indexes {
  const personById = new Map(graph.persons.map((p) => [p.id, p]));
  const parentsOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const partnersOf = new Map<string, string[]>();

  const push = (m: Map<string, string[]>, k: string, v: string) => {
    const arr = m.get(k) ?? [];
    if (!arr.includes(v)) arr.push(v);
    m.set(k, arr);
  };

  for (const r of graph.relationships) {
    if (r.type === "PARENT_CHILD") {
      // personA = progenitor, personB = hijo
      push(childrenOf, r.personAId, r.personBId);
      push(parentsOf, r.personBId, r.personAId);
    } else if (r.type === "PARTNER") {
      push(partnersOf, r.personAId, r.personBId);
      push(partnersOf, r.personBId, r.personAId);
    }
  }

  return { personById, parentsOf, childrenOf, partnersOf };
}

/**
 * Calcula el layout de generaciones centrado en una persona.
 * Devuelve nodos con fila (generación) y columna (orden horizontal).
 */
export function computeLayout(
  graph: TreeGraph,
  options: LayoutOptions
): TreeLayout {
  const {
    focusId,
    ancestorDepth = 2,
    descendantDepth = 2,
    collapsed = new Set<string>(),
  } = options;

  const idx = buildIndexes(graph);
  if (!idx.personById.has(focusId)) {
    return { nodes: [], edges: [], cols: 0, rows: 0 };
  }

  // generación por persona visible
  const generation = new Map<string, number>();
  const visible = new Set<string>();
  const edges: LayoutEdge[] = [];

  // BFS hacia arriba (ancestros) y hacia abajo (descendientes)
  const queue: { id: string; gen: number }[] = [{ id: focusId, gen: 0 }];
  generation.set(focusId, 0);
  visible.add(focusId);

  while (queue.length) {
    const { id, gen } = queue.shift()!;

    // ancestros
    if (gen > -ancestorDepth) {
      for (const parentId of idx.parentsOf.get(id) ?? []) {
        edges.push({ fromId: parentId, toId: id, kind: "parent" });
        if (!visible.has(parentId)) {
          visible.add(parentId);
          generation.set(parentId, gen - 1);
          queue.push({ id: parentId, gen: gen - 1 });
        }
      }
    }

    // descendientes (respetando colapso)
    if (gen < descendantDepth && !collapsed.has(id)) {
      for (const childId of idx.childrenOf.get(id) ?? []) {
        edges.push({ fromId: id, toId: childId, kind: "parent" });
        if (!visible.has(childId)) {
          visible.add(childId);
          generation.set(childId, gen + 1);
          queue.push({ id: childId, gen: gen + 1 });
        }
      }
    }
  }

  // incluir parejas de los nodos visibles (misma generación, sin expandir sus ramas)
  for (const id of Array.from(visible)) {
    for (const partnerId of idx.partnersOf.get(id) ?? []) {
      if (!visible.has(partnerId)) {
        visible.add(partnerId);
        generation.set(partnerId, generation.get(id) ?? 0);
      }
      edges.push({ fromId: id, toId: partnerId, kind: "partner" });
    }
  }

  // agrupar por generación y asignar columnas
  const byGen = new Map<number, string[]>();
  for (const id of visible) {
    const g = generation.get(id) ?? 0;
    const arr = byGen.get(g) ?? [];
    arr.push(id);
    byGen.set(g, arr);
  }

  const gens = Array.from(byGen.keys()).sort((a, b) => a - b);
  const minGen = gens[0] ?? 0;

  const nodes: LayoutNode[] = [];
  let maxCols = 0;

  for (const g of gens) {
    const ids = byGen.get(g)!;
    // ordenar: mantener parejas adyacentes
    ids.sort((a, b) => {
      const na = idx.personById.get(a)!;
      const nb = idx.personById.get(b)!;
      return (na.firstName + (na.lastName ?? "")).localeCompare(
        nb.firstName + (nb.lastName ?? "")
      );
    });

    ids.forEach((id, i) => {
      const person = idx.personById.get(id)!;
      const partnerIds = idx.partnersOf.get(id) ?? [];
      const visiblePartner = partnerIds.find((pid) => visible.has(pid)) ?? null;

      const childIds = idx.childrenOf.get(id) ?? [];
      const parentIds = idx.parentsOf.get(id) ?? [];

      nodes.push({
        person,
        col: i,
        row: g - minGen,
        generation: g,
        partnerId: visiblePartner,
        hasHiddenParents:
          parentIds.length > 0 && parentIds.every((p) => !visible.has(p)),
        hasHiddenChildren:
          childIds.length > 0 &&
          (collapsed.has(id) || childIds.every((c) => !visible.has(c))),
      });
    });

    maxCols = Math.max(maxCols, ids.length);
  }

  // de-duplicar edges
  const seen = new Set<string>();
  const dedupEdges = edges.filter((e) => {
    const key =
      e.kind === "partner"
        ? ["p", ...[e.fromId, e.toId].sort()].join(":")
        : `c:${e.fromId}:${e.toId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    nodes,
    edges: dedupEdges.filter(
      (e) => visible.has(e.fromId) && visible.has(e.toId)
    ),
    cols: maxCols,
    rows: gens.length,
  };
}
