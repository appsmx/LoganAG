"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TreeCanvas from "@/components/TreeCanvas";
import AiIntakePanel from "@/components/AiIntakePanel";
import PersonForm from "@/components/PersonForm";
import RelationshipForm from "@/components/RelationshipForm";
import type { PersonDTO, TreeGraph } from "@/lib/types";
import { fullName } from "@/lib/utils";

export default function ArbolPage() {
  const [graph, setGraph] = useState<TreeGraph>({
    persons: [],
    relationships: [],
  });
  const [loading, setLoading] = useState(true);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [panel, setPanel] = useState<"detail" | "new" | "link" | "ai">("detail");

  const loadGraph = useCallback(async () => {
    const res = await fetch("/api/tree", { cache: "no-store" });
    const data = await res.json();
    const g: TreeGraph = {
      persons: data.persons ?? [],
      relationships: data.relationships ?? [],
    };
    setGraph(g);
    setLoading(false);
    if (!focusId && g.persons.length > 0) setFocusId(g.persons[0].id);
  }, [focusId]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const selected = useMemo(
    () => graph.persons.find((p) => p.id === selectedId) ?? null,
    [graph.persons, selectedId]
  );

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-leaf-600 hover:underline">
            ← Inicio
          </Link>
          <h1 className="text-2xl font-bold text-bark-900">Mi familia 🌳</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPanel("new")}
            className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
          >
            + Persona
          </button>
          <button
            onClick={() => setPanel("link")}
            className="rounded-lg border border-bark-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-bark-100"
          >
            Vincular
          </button>
          <button
            onClick={() => setPanel("ai")}
            className="rounded-lg border border-leaf-400 bg-leaf-100 px-4 py-2 text-sm font-semibold text-leaf-700 hover:bg-leaf-100/70"
          >
            🤖 Describir familia
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Lienzo */}
        <section className="min-h-[480px]">
          {loading ? (
            <div className="flex h-[480px] items-center justify-center text-bark-600">
              Cargando árbol…
            </div>
          ) : graph.persons.length === 0 ? (
            <EmptyState onAdd={() => setPanel("new")} onAi={() => setPanel("ai")} />
          ) : (
            <TreeCanvas
              graph={graph}
              focusId={focusId}
              collapsed={collapsed}
              onFocus={setFocusId}
              onToggleCollapse={toggleCollapse}
              onSelect={(id) => {
                setSelectedId(id);
                setPanel("detail");
              }}
              selectedId={selectedId}
            />
          )}
          <p className="mt-2 text-xs text-bark-500">
            Clic para seleccionar · doble clic para enfocar · − / + para
            colapsar o expandir ramas.
          </p>
        </section>

        {/* Panel lateral */}
        <aside className="rounded-xl border border-bark-200 bg-white/60 p-4">
          {panel === "ai" && (
            <AiIntakePanel
              existingPersons={graph.persons}
              onConfirmed={async () => {
                await loadGraph();
                setPanel("detail");
              }}
              onClose={() => setPanel("detail")}
            />
          )}

          {panel === "new" && (
            <PersonForm
              onSaved={async (p) => {
                await loadGraph();
                setSelectedId(p.id);
                if (!focusId) setFocusId(p.id);
                setPanel("detail");
              }}
              onCancel={() => setPanel("detail")}
            />
          )}

          {panel === "link" && (
            <RelationshipForm
              persons={graph.persons}
              onSaved={async () => {
                await loadGraph();
                setPanel("detail");
              }}
              onCancel={() => setPanel("detail")}
            />
          )}

          {panel === "detail" &&
            (selected ? (
              <PersonDetail
                person={selected}
                onFocus={() => setFocusId(selected.id)}
                onEdited={loadGraph}
                onDeleted={async () => {
                  setSelectedId(null);
                  if (focusId === selected.id) setFocusId(null);
                  await loadGraph();
                }}
              />
            ) : (
              <p className="text-sm text-bark-600">
                Selecciona una persona del árbol para ver su ficha.
              </p>
            ))}
        </aside>
      </div>

      <footer className="mt-10 border-t border-bark-200 pt-4 text-center text-xs text-bark-500">
        🤖 Las sugerencias de IA requieren tu confirmación antes de guardarse ·{" "}
        <Link href="/privacidad" className="hover:underline">
          Aviso de privacidad
        </Link>
      </footer>
    </main>
  );
}

function EmptyState({
  onAdd,
  onAi,
}: {
  onAdd: () => void;
  onAi: () => void;
}) {
  return (
    <div className="flex h-[480px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-bark-200 bg-white/40 text-center">
      <p className="text-lg font-semibold text-bark-800">
        Tu árbol está vacío
      </p>
      <p className="max-w-sm text-sm text-bark-600">
        Empieza agregando a la primera persona, o describe a tu familia en
        lenguaje natural y deja que la IA la proponga.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onAdd}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
        >
          + Agregar persona
        </button>
        <button
          onClick={onAi}
          className="rounded-lg border border-leaf-400 bg-leaf-100 px-4 py-2 text-sm font-semibold text-leaf-700"
        >
          🤖 Describir familia
        </button>
      </div>
    </div>
  );
}

function PersonDetail({
  person,
  onFocus,
  onEdited,
  onDeleted,
}: {
  person: PersonDTO;
  onFocus: () => void;
  onEdited: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <PersonForm
        person={person}
        onSaved={async () => {
          setEditing(false);
          await onEdited();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-bark-900">{fullName(person)}</h2>
      {person.nickname && (
        <p className="text-sm italic text-bark-600">«{person.nickname}»</p>
      )}
      <dl className="mt-3 space-y-1 text-sm text-bark-700">
        <Row label="Nacimiento" value={person.birthDate && new Date(person.birthDate).toLocaleDateString("es-MX")} />
        <Row label="Lugar" value={person.birthPlace} />
        {!person.isLiving && (
          <Row label="Defunción" value={person.deathDate && new Date(person.deathDate).toLocaleDateString("es-MX")} />
        )}
        <Row label="Estado" value={person.isLiving ? "Viva" : "Fallecida"} />
      </dl>
      {person.notes && (
        <p className="mt-3 rounded bg-bark-50 p-2 text-sm text-bark-700">
          {person.notes}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={onFocus}
          className="rounded-lg bg-leaf-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-leaf-700"
        >
          Enfocar
        </button>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg border border-bark-200 px-3 py-1.5 text-sm font-semibold text-bark-700 hover:bg-bark-100"
        >
          Editar
        </button>
        <button
          onClick={async () => {
            if (!confirm(`¿Eliminar a ${fullName(person)}?`)) return;
            await fetch(`/api/persons/${person.id}`, { method: "DELETE" });
            await onDeleted();
          }}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-bark-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
