"use client";

import { useCallback, useEffect, useState } from "react";
import type { PersonDTO } from "@/lib/types";
import { fullName } from "@/lib/utils";

interface PetOwner {
  person: { id: string; firstName: string; lastName: string | null };
}
interface Pet {
  id: string;
  name: string;
  species: string | null;
  breed: string | null;
  notes: string | null;
  owners: PetOwner[];
}

const inputCls =
  "w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none";

export default function PetsPanel({
  persons,
  canEdit,
  onClose,
}: {
  persons: PersonDTO[];
  canEdit: boolean;
  onClose: () => void;
}) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [notes, setNotes] = useState("");
  const [ownerIds, setOwnerIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/pets", { cache: "no-store" });
    const data = await res.json();
    setPets(data.pets ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleOwner(id: string) {
    setOwnerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (ownerIds.length === 0) {
      setError("Elige al menos un dueño.");
      return;
    }
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        species: species || null,
        notes: notes || null,
        ownerIds,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar.");
      return;
    }
    setName("");
    setSpecies("");
    setNotes("");
    setOwnerIds([]);
    setAdding(false);
    await load();
  }

  async function remove(id: string) {
    await fetch(`/api/pets/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-bark-900">Mascotas 🐾</h2>
        <button onClick={onClose} className="text-sm text-bark-500 hover:text-bark-800">
          ✕
        </button>
      </div>
      <p className="text-xs text-bark-600">
        Las mascotas también son familia. Ligadas a una o varias personas.
      </p>

      {canEdit &&
        (adding ? (
          <form onSubmit={add} className="space-y-2 rounded-lg border border-bark-200 bg-white p-3">
            <input className={inputCls} placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
            <input className={inputCls} placeholder="Especie (perro, gato…)" value={species} onChange={(e) => setSpecies(e.target.value)} />
            <textarea className={inputCls} rows={2} placeholder="Notas / anécdota" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div>
              <p className="mb-1 text-xs text-bark-600">Dueño(s):</p>
              <div className="max-h-28 space-y-1 overflow-auto">
                {persons.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-bark-700">
                    <input
                      type="checkbox"
                      checked={ownerIds.includes(p.id)}
                      onChange={() => toggleOwner(p.id)}
                    />
                    {fullName(p)}
                  </label>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-leaf-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-leaf-700">
                Guardar
              </button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg border border-bark-200 px-3 py-1.5 text-xs font-semibold text-bark-700">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
          >
            + Agregar mascota
          </button>
        ))}

      {loading ? (
        <p className="text-xs text-bark-500">Cargando…</p>
      ) : pets.length === 0 ? (
        <p className="text-xs text-bark-500">Aún no hay mascotas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {pets.map((pet) => (
            <li key={pet.id} className="rounded-lg border border-bark-200 bg-white p-2 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-bark-900">
                    🐾 {pet.name}
                    {pet.species ? ` · ${pet.species}` : ""}
                  </p>
                  <p className="text-xs text-bark-600">
                    De: {pet.owners.map((o) => o.person.firstName).join(", ") || "—"}
                  </p>
                  {pet.notes && <p className="mt-1 text-bark-700">{pet.notes}</p>}
                </div>
                {canEdit && (
                  <button onClick={() => remove(pet.id)} className="text-xs text-red-500 hover:underline">
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
