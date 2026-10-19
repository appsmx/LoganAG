"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TreeCanvas from "@/components/TreeCanvas";
import AiIntakePanel from "@/components/AiIntakePanel";
import PersonForm from "@/components/PersonForm";
import RelationshipForm from "@/components/RelationshipForm";
import AnecdotesPanel from "@/components/AnecdotesPanel";
import PetsPanel from "@/components/PetsPanel";
import InvitePanel from "@/components/InvitePanel";
import TimelinePanel from "@/components/TimelinePanel";
import InterviewPanel from "@/components/InterviewPanel";
import type { PersonDTO, TreeGraph } from "@/lib/types";
import { fullName } from "@/lib/utils";

type Panel =
  | "detail"
  | "new"
  | "link"
  | "ai"
  | "pets"
  | "invite"
  | "timeline"
  | "interview";

export default function ArbolPage() {
  const router = useRouter();
  const [graph, setGraph] = useState<TreeGraph>({
    persons: [],
    relationships: [],
  });
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [me, setMe] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [panel, setPanel] = useState<Panel>("detail");

  const loadGraph = useCallback(async () => {
    const res = await fetch("/api/tree", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/entrar");
      return;
    }
    const data = await res.json();
    const g: TreeGraph = {
      persons: data.persons ?? [],
      relationships: data.relationships ?? [],
    };
    setGraph(g);
    setCanEdit(Boolean(data.access?.canEdit));
    setLoading(false);
    setFocusId((prev) => prev ?? g.persons[0]?.id ?? null);
  }, [router]);

  useEffect(() => {
    loadGraph();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user?.email ?? null))
      .catch(() => {});
  }, [loadGraph]);

  const selected = useMemo(
    () => graph.persons.find((p) => p.id === selectedId) ?? null,
    [graph.persons, selectedId]
  );

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/entrar");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-leaf-600 hover:underline">
            ← Inicio
          </Link>
          <h1 className="text-2xl font-bold text-bark-900">Mi familia 🌳</h1>
          {me && <p className="text-xs text-bark-500">{me}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <>
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
                className="rounded-lg border border-leaf-400 bg-leaf-100 px-4 py-2 text-sm font-semibold text-leaf-700"
              >
                🤖 Describir familia
              </button>
              <button
                onClick={() => setPanel("interview")}
                className="rounded-lg border border-leaf-400 bg-leaf-100 px-4 py-2 text-sm font-semibold text-leaf-700"
              >
                🤖 Entrevista
              </button>
            </>
          )}
          <button
            onClick={() => setPanel("timeline")}
            className="rounded-lg border border-bark-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-bark-100"
          >
            🕰️ Línea de tiempo
          </button>
          <button
            onClick={() => setPanel("pets")}
            className="rounded-lg border border-bark-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-bark-100"
          >
            🐾 Mascotas
          </button>
          <button
            onClick={() => setPanel("invite")}
            className="rounded-lg border border-bark-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-bark-100"
          >
            👪 Familia
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-bark-200 px-3 py-2 text-sm text-bark-500 hover:bg-bark-100"
          >
            Salir
          </button>
        </div>
      </header>

      {!canEdit && !loading && (
        <p className="mb-3 rounded-lg bg-bark-100 px-3 py-2 text-sm text-bark-700">
          Tienes acceso de solo lectura a este árbol.
        </p>
      )}

      {graph.persons.length > 0 && (
        <PersonSearch
          persons={graph.persons}
          onPick={(id) => {
            setSelectedId(id);
            setFocusId(id);
            setPanel("detail");
          }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="min-h-[480px]">
          {loading ? (
            <div className="flex h-[480px] items-center justify-center text-bark-600">
              Cargando árbol…
            </div>
          ) : graph.persons.length === 0 ? (
            <EmptyState
              canEdit={canEdit}
              onAdd={() => setPanel("new")}
              onAi={() => setPanel("ai")}
            />
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

        <aside className="rounded-xl border border-bark-200 bg-white/60 p-4">
          {panel === "ai" && canEdit && (
            <AiIntakePanel
              existingPersons={graph.persons}
              onConfirmed={async () => {
                await loadGraph();
                setPanel("detail");
              }}
              onClose={() => setPanel("detail")}
            />
          )}

          {panel === "new" && canEdit && (
            <PersonForm
              onSaved={async (p) => {
                await loadGraph();
                setSelectedId(p.id);
                setFocusId((prev) => prev ?? p.id);
                setPanel("detail");
              }}
              onCancel={() => setPanel("detail")}
            />
          )}

          {panel === "link" && canEdit && (
            <RelationshipForm
              persons={graph.persons}
              onSaved={async () => {
                await loadGraph();
                setPanel("detail");
              }}
              onCancel={() => setPanel("detail")}
            />
          )}

          {panel === "pets" && (
            <PetsPanel
              persons={graph.persons}
              canEdit={canEdit}
              onChanged={loadGraph}
              onClose={() => setPanel("detail")}
            />
          )}

          {panel === "invite" && (
            <InvitePanel onClose={() => setPanel("detail")} />
          )}

          {panel === "timeline" && (
            <TimelinePanel onClose={() => setPanel("detail")} />
          )}

          {panel === "interview" && canEdit && (
            <InterviewPanel onClose={() => setPanel("detail")} />
          )}

          {panel === "detail" &&
            (selected ? (
              <PersonDetail
                person={selected}
                canEdit={canEdit}
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

function PersonSearch({
  persons,
  onPick,
}: {
  persons: PersonDTO[];
  onPick: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const matches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return persons
      .filter((p) => fullName(p).toLowerCase().includes(term))
      .slice(0, 6);
  }, [q, persons]);

  return (
    <div className="relative mb-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔍 Buscar persona en el árbol…"
        className="w-full max-w-sm rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none"
      />
      {matches.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-w-sm overflow-hidden rounded-lg border border-bark-200 bg-white shadow-lg">
          {matches.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  onPick(p.id);
                  setQ("");
                }}
                className="block w-full px-3 py-2 text-left text-sm text-bark-800 hover:bg-leaf-100"
              >
                {fullName(p)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyState({
  canEdit,
  onAdd,
  onAi,
}: {
  canEdit: boolean;
  onAdd: () => void;
  onAi: () => void;
}) {
  return (
    <div className="flex h-[480px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-bark-200 bg-white/40 text-center">
      <p className="text-lg font-semibold text-bark-800">Tu árbol está vacío</p>
      {canEdit ? (
        <>
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
        </>
      ) : (
        <p className="max-w-sm text-sm text-bark-600">
          Aún no hay personas en este árbol.
        </p>
      )}
    </div>
  );
}

function PersonDetail({
  person,
  canEdit,
  onFocus,
  onEdited,
  onDeleted,
}: {
  person: PersonDTO;
  canEdit: boolean;
  onFocus: () => void;
  onEdited: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  async function generateBio() {
    setBioLoading(true);
    setBioError(null);
    setBio(null);
    const res = await fetch(`/api/persons/${person.id}/biography`, {
      method: "POST",
    });
    setBioLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBioError(data.error ?? "No se pudo generar la biografía.");
      return;
    }
    setBio(data.biography);
  }

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
      {person.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.photoUrl}
          alt={fullName(person)}
          className="mb-2 h-20 w-20 rounded-full object-cover"
        />
      )}
      <h2 className="text-lg font-bold text-bark-900">{fullName(person)}</h2>
      {person.nickname && (
        <p className="text-sm italic text-bark-600">«{person.nickname}»</p>
      )}
      <dl className="mt-3 space-y-1 text-sm text-bark-700">
        <Row
          label="Nacimiento"
          value={
            person.birthDate &&
            new Date(person.birthDate).toLocaleDateString("es-MX")
          }
        />
        <Row label="Lugar" value={person.birthPlace} />
        {!person.isLiving && (
          <Row
            label="Defunción"
            value={
              person.deathDate &&
              new Date(person.deathDate).toLocaleDateString("es-MX")
            }
          />
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
        {canEdit && (
          <>
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
          </>
        )}
      </div>

      {/* Biografía narrada por IA (P2, DEC-003) */}
      <div className="mt-4 border-t border-bark-200 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-bark-800">
            Biografía (IA)
          </h3>
          <button
            onClick={generateBio}
            disabled={bioLoading}
            className="text-xs font-semibold text-leaf-600 hover:underline disabled:opacity-60"
          >
            {bioLoading
              ? "Generando…"
              : bio
                ? "Regenerar"
                : "✨ Generar con IA"}
          </button>
        </div>
        {bioError && <p className="mt-1 text-xs text-red-600">{bioError}</p>}
        {bio && (
          <div className="mt-2 rounded-lg border border-leaf-400 bg-leaf-100/60 p-2 text-sm text-bark-800">
            <p className="whitespace-pre-wrap">{bio}</p>
            <p className="mt-2 text-[10px] text-bark-500">
              🤖 Texto generado por IA. Revísalo antes de darlo por bueno.
            </p>
          </div>
        )}
      </div>

      {/* Anécdotas e hitos (DEC-002 P1) */}
      <AnecdotesPanel personId={person.id} canEdit={canEdit} />
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
