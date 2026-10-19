"use client";

import { useCallback, useEffect, useState } from "react";

interface Anecdote {
  id: string;
  title: string;
  body: string;
  type: "STORY" | "MILESTONE" | "KEY_POINT";
  date: string | null;
}

const typeLabel: Record<Anecdote["type"], string> = {
  STORY: "Anécdota",
  MILESTONE: "Hito",
  KEY_POINT: "Punto clave",
};

const inputCls =
  "w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none";

export default function AnecdotesPanel({
  personId,
  canEdit,
}: {
  personId: string;
  canEdit: boolean;
}) {
  const [items, setItems] = useState<Anecdote[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [type, setType] = useState<Anecdote["type"]>("STORY");

  const load = useCallback(async () => {
    const res = await fetch(`/api/persons/${personId}/anecdotes`, {
      cache: "no-store",
    });
    const data = await res.json();
    setItems(data.anecdotes ?? []);
    setLoading(false);
  }, [personId]);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !bodyText.trim()) return;
    const res = await fetch(`/api/persons/${personId}/anecdotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body: bodyText, type }),
    });
    if (res.ok) {
      setTitle("");
      setBodyText("");
      setType("STORY");
      setAdding(false);
      await load();
    }
  }

  async function remove(id: string) {
    await fetch(`/api/anecdotes/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="mt-4 border-t border-bark-200 pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-bark-800">
          Anécdotas e hitos
        </h3>
        {canEdit && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-semibold text-leaf-600 hover:underline"
          >
            + Agregar
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={add} className="mt-2 space-y-2">
          <input
            className={inputCls}
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className={inputCls}
            value={type}
            onChange={(e) => setType(e.target.value as Anecdote["type"])}
          >
            <option value="STORY">Anécdota</option>
            <option value="MILESTONE">Hito</option>
            <option value="KEY_POINT">Punto clave</option>
          </select>
          <textarea
            className={inputCls}
            rows={3}
            placeholder="Cuenta la historia…"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-leaf-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-leaf-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-lg border border-bark-200 px-3 py-1.5 text-xs font-semibold text-bark-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-2 text-xs text-bark-500">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="mt-2 text-xs text-bark-500">
          Aún no hay anécdotas de esta persona.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-bark-200 bg-white p-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded bg-leaf-100 px-1.5 py-0.5 text-[10px] font-semibold text-leaf-700">
                    {typeLabel[a.type]}
                  </span>
                  <p className="mt-1 font-semibold text-bark-900">{a.title}</p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => remove(a.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-bark-700">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
