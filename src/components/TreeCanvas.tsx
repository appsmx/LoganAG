"use client";

import { useMemo } from "react";
import type { TreeGraph } from "@/lib/types";
import { computeLayout } from "@/lib/tree-layout";
import { fullName } from "@/lib/utils";

const CELL_W = 180;
const CELL_H = 120;
const NODE_W = 150;
const NODE_H = 76;

interface Props {
  graph: TreeGraph;
  focusId: string | null;
  collapsed: Set<string>;
  onFocus: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
}

/**
 * Lienzo del árbol (DEC-002: enfoque + contexto, sin saturar).
 * Renderiza en SVG las generaciones alrededor de la persona enfocada.
 */
export default function TreeCanvas({
  graph,
  focusId,
  collapsed,
  onFocus,
  onToggleCollapse,
  onSelect,
  selectedId,
}: Props) {
  const layout = useMemo(() => {
    if (!focusId) return null;
    return computeLayout(graph, {
      focusId,
      ancestorDepth: 2,
      descendantDepth: 2,
      collapsed,
    });
  }, [graph, focusId, collapsed]);

  // Nº de mascotas por persona, para mostrar un badge 🐾 en su nodo (DEC-009).
  const petsByPerson = useMemo(() => {
    const m = new Map<string, number>();
    for (const pet of graph.pets ?? []) {
      for (const ownerId of pet.ownerIds) {
        m.set(ownerId, (m.get(ownerId) ?? 0) + 1);
      }
    }
    return m;
  }, [graph.pets]);

  if (!focusId || !layout || layout.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center text-bark-600">
        Selecciona una persona para enfocar el árbol.
      </div>
    );
  }

  // posición por nodo
  const pos = new Map<string, { x: number; y: number }>();
  // centrar cada generación
  const byRow = new Map<number, typeof layout.nodes>();
  for (const n of layout.nodes) {
    const arr = byRow.get(n.row) ?? [];
    arr.push(n);
    byRow.set(n.row, arr);
  }
  const maxRowLen = Math.max(
    ...Array.from(byRow.values()).map((a) => a.length)
  );
  const width = Math.max(maxRowLen * CELL_W + 40, 480);
  const height = layout.rows * CELL_H + 40;

  for (const [row, arr] of byRow) {
    const rowWidth = arr.length * CELL_W;
    const offsetX = (width - rowWidth) / 2;
    arr.forEach((n, i) => {
      pos.set(n.person.id, {
        x: offsetX + i * CELL_W + CELL_W / 2,
        y: 30 + row * CELL_H + NODE_H / 2,
      });
    });
  }

  return (
    <div className="h-full w-full overflow-auto rounded-xl border border-bark-200 bg-white/40 p-2">
      <svg width={width} height={height} className="mx-auto block">
        {/* aristas */}
        {layout.edges.map((e, i) => {
          const a = pos.get(e.fromId);
          const b = pos.get(e.toId);
          if (!a || !b) return null;
          const color = e.kind === "partner" ? "#8a5a2b" : "#6aa84f";
          const dash = e.kind === "partner" ? "4 3" : undefined;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={dash}
            />
          );
        })}

        {/* nodos */}
        {layout.nodes.map((n) => {
          const p = pos.get(n.person.id)!;
          const isFocus = n.person.id === focusId;
          const isSelected = n.person.id === selectedId;
          return (
            <g
              key={n.person.id}
              transform={`translate(${p.x - NODE_W / 2}, ${p.y - NODE_H / 2})`}
            >
              <rect
                width={NODE_W}
                height={NODE_H}
                rx={10}
                className="cursor-pointer"
                fill={isFocus ? "#e3f0dd" : "#ffffff"}
                stroke={
                  isSelected ? "#4a7a34" : isFocus ? "#6aa84f" : "#dcc5a8"
                }
                strokeWidth={isSelected || isFocus ? 3 : 1.5}
                onClick={() => onSelect(n.person.id)}
                onDoubleClick={() => onFocus(n.person.id)}
              />
              <text
                x={NODE_W / 2}
                y={26}
                textAnchor="middle"
                className="pointer-events-none select-none fill-bark-900 text-[13px] font-semibold"
              >
                {truncate(fullName(n.person), 20)}
              </text>
              <text
                x={NODE_W / 2}
                y={46}
                textAnchor="middle"
                className="pointer-events-none select-none fill-bark-600 text-[11px]"
              >
                {lifeSpan(n.person)}
              </text>

              {/* badge de mascotas (DEC-009): esquina superior derecha */}
              {petsByPerson.has(n.person.id) && (
                <g className="pointer-events-none">
                  <circle
                    cx={NODE_W - 12}
                    cy={12}
                    r={11}
                    fill="#f0e6d9"
                    stroke="#8a5a2b"
                    strokeWidth={1}
                  />
                  <text
                    x={NODE_W - 12}
                    y={16}
                    textAnchor="middle"
                    className="select-none text-[11px]"
                  >
                    🐾
                  </text>
                  {petsByPerson.get(n.person.id)! > 1 && (
                    <text
                      x={NODE_W - 12}
                      y={30}
                      textAnchor="middle"
                      className="select-none fill-bark-700 text-[9px] font-bold"
                    >
                      ×{petsByPerson.get(n.person.id)}
                    </text>
                  )}
                </g>
              )}

              {/* indicador de padres ocultos (arriba) */}
              {n.hasHiddenParents && (
                <circle
                  cx={NODE_W / 2}
                  cy={0}
                  r={7}
                  fill="#6aa84f"
                  className="cursor-pointer"
                  onClick={() => onFocus(n.person.id)}
                >
                  <title>Hay ancestros ocultos. Doble clic para enfocar.</title>
                </circle>
              )}

              {/* botón colapsar/expandir hijos (abajo) */}
              {n.hasHiddenChildren && (
                <g
                  className="cursor-pointer"
                  onClick={() => onToggleCollapse(n.person.id)}
                >
                  <circle cx={NODE_W / 2} cy={NODE_H} r={9} fill="#4a7a34" />
                  <text
                    x={NODE_W / 2}
                    y={NODE_H + 4}
                    textAnchor="middle"
                    className="pointer-events-none select-none fill-white text-[12px] font-bold"
                  >
                    {collapsed.has(n.person.id) ? "+" : "−"}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function lifeSpan(p: {
  birthDate: string | null;
  deathDate: string | null;
  isLiving: boolean;
}): string {
  const b = p.birthDate ? new Date(p.birthDate).getFullYear() : "?";
  if (p.deathDate) return `${b} – ${new Date(p.deathDate).getFullYear()}`;
  return p.isLiving ? `n. ${b}` : `${b} – ?`;
}
