"use client";

import { useState } from "react";
import type { PersonDTO, RelationshipType } from "@/lib/types";
import { fullName } from "@/lib/utils";

interface Props {
  persons: PersonDTO[];
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
}

const inputCls =
  "w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none";

export default function RelationshipForm({ persons, onSaved, onCancel }: Props) {
  const [type, setType] = useState<RelationshipType>("PARENT_CHILD");
  const [personAId, setPersonAId] = useState("");
  const [personBId, setPersonBId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!personAId || !personBId) {
      setError("Elige a las dos personas.");
      return;
    }
    if (personAId === personBId) {
      setError("Deben ser personas distintas.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, personAId, personBId }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el vínculo.");
      return;
    }
    await onSaved();
  }

  const labelA = type === "PARENT_CHILD" ? "Progenitor (padre/madre)" : "Persona 1";
  const labelB = type === "PARENT_CHILD" ? "Hijo/a" : "Persona 2 (pareja)";

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="text-lg font-bold text-bark-900">Vincular personas</h2>

      <div>
        <label className="text-xs text-bark-600">Tipo de vínculo</label>
        <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as RelationshipType)}>
          <option value="PARENT_CHILD">Padre/madre → hijo/a</option>
          <option value="PARTNER">Pareja</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-bark-600">{labelA}</label>
        <select className={inputCls} value={personAId} onChange={(e) => setPersonAId(e.target.value)}>
          <option value="">— elegir —</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{fullName(p)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-bark-600">{labelB}</label>
        <select className={inputCls} value={personBId} onChange={(e) => setPersonBId(e.target.value)}>
          <option value="">— elegir —</option>
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{fullName(p)}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700 disabled:opacity-60">
          {saving ? "Vinculando…" : "Crear vínculo"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-bark-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-bark-100">
          Cancelar
        </button>
      </div>
    </form>
  );
}
