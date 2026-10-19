"use client";

import { useState } from "react";
import type { PersonDTO, ProposedGraph } from "@/lib/types";

interface Props {
  existingPersons: PersonDTO[];
  onConfirmed: () => void | Promise<void>;
  onClose: () => void;
}

const inputCls =
  "w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none";

/**
 * DEC-004: alta por lenguaje natural con IA.
 * Flujo: describir → la IA propone → el usuario revisa y confirma → se persiste.
 * Nunca se guarda sin confirmación humana.
 */
export default function AiIntakePanel({ onConfirmed, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposedGraph | null>(null);
  const [saving, setSaving] = useState(false);

  async function propose(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/ai/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "El asistente no está disponible por ahora.");
      return;
    }
    setProposal(data.proposal as ProposedGraph);
  }

  async function confirm() {
    if (!proposal) return;
    setSaving(true);
    const res = await fetch("/api/ai/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        persons: proposal.persons,
        relationships: proposal.relationships,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("No se pudo guardar lo confirmado.");
      return;
    }
    setProposal(null);
    setDescription("");
    await onConfirmed();
  }

  const nameByTemp = (ref: string) =>
    proposal?.persons.find((p) => p.tempId === ref)?.firstName ?? ref;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-bark-900">
          🤖 Describir familia
        </h2>
        <button
          onClick={onClose}
          className="text-sm text-bark-500 hover:text-bark-800"
        >
          ✕
        </button>
      </div>

      <p className="rounded bg-leaf-100 p-2 text-xs text-leaf-700">
        Escribe en tus palabras. La IA propondrá a las personas y sus vínculos;
        <strong> tú confirmas</strong> antes de guardar. Nada se guarda sin tu
        revisión.
      </p>

      {!proposal && (
        <form onSubmit={propose} className="space-y-2">
          <textarea
            className={inputCls}
            rows={5}
            placeholder="Ej: Mi abuelo Juan Pérez nació en Culiacán en 1940, se casó con mi abuela Rosa López y tuvieron tres hijos: María, José y Pedro."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || description.trim().length < 3}
            className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700 disabled:opacity-60"
          >
            {loading ? "Interpretando…" : "Proponer con IA"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {proposal && (
        <div className="space-y-3">
          {proposal.summary && (
            <p className="text-sm italic text-bark-600">“{proposal.summary}”</p>
          )}

          <div>
            <h3 className="text-sm font-semibold text-bark-800">
              Personas propuestas ({proposal.persons.length})
            </h3>
            <ul className="mt-1 space-y-1 text-sm text-bark-700">
              {proposal.persons.map((p) => (
                <li
                  key={p.tempId}
                  className="rounded border border-bark-200 bg-white px-2 py-1"
                >
                  {p.firstName} {p.lastName ?? ""}
                  {p.birthPlace ? ` · ${p.birthPlace}` : ""}
                  {p.birthDate ? ` · ${p.birthDate}` : ""}
                </li>
              ))}
            </ul>
          </div>

          {proposal.relationships.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-bark-800">
                Vínculos propuestos ({proposal.relationships.length})
              </h3>
              <ul className="mt-1 space-y-1 text-sm text-bark-700">
                {proposal.relationships.map((r, i) => (
                  <li
                    key={i}
                    className="rounded border border-bark-200 bg-white px-2 py-1"
                  >
                    {r.type === "PARENT_CHILD"
                      ? `${nameByTemp(r.personARef)} → es padre/madre de → ${nameByTemp(r.personBRef)}`
                      : `${nameByTemp(r.personARef)} ↔ pareja de ↔ ${nameByTemp(r.personBRef)}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={confirm}
              disabled={saving}
              className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Confirmar y guardar"}
            </button>
            <button
              onClick={() => setProposal(null)}
              className="rounded-lg border border-bark-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-bark-100"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
