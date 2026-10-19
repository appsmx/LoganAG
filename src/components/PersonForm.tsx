"use client";

import { useState } from "react";
import type { PersonDTO } from "@/lib/types";

interface Props {
  person?: PersonDTO;
  onSaved: (person: PersonDTO) => void | Promise<void>;
  onCancel: () => void;
}

const inputCls =
  "w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none";

export default function PersonForm({ person, onSaved, onCancel }: Props) {
  const [firstName, setFirstName] = useState(person?.firstName ?? "");
  const [lastName, setLastName] = useState(person?.lastName ?? "");
  const [nickname, setNickname] = useState(person?.nickname ?? "");
  const [gender, setGender] = useState(person?.gender ?? "UNKNOWN");
  const [birthDate, setBirthDate] = useState(
    person?.birthDate ? person.birthDate.slice(0, 10) : ""
  );
  const [birthPlace, setBirthPlace] = useState(person?.birthPlace ?? "");
  const [isLiving, setIsLiving] = useState(person?.isLiving ?? true);
  const [notes, setNotes] = useState(person?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(person);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setSaving(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || null,
      nickname: nickname.trim() || null,
      gender,
      birthDate: birthDate || null,
      birthPlace: birthPlace.trim() || null,
      isLiving,
      notes: notes.trim() || null,
    };

    const res = await fetch(
      isEdit ? `/api/persons/${person!.id}` : "/api/persons",
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);

    if (!res.ok) {
      setError("No se pudo guardar. Revisa los datos.");
      return;
    }
    const data = await res.json();
    await onSaved(data.person);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h2 className="text-lg font-bold text-bark-900">
        {isEdit ? "Editar persona" : "Nueva persona"}
      </h2>

      <div>
        <label className="text-xs text-bark-600">Nombre *</label>
        <input
          className={inputCls}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-bark-600">Apellidos</label>
        <input
          className={inputCls}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-bark-600">Apodo</label>
        <input
          className={inputCls}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-bark-600">Género</label>
          <select
            className={inputCls}
            value={gender}
            onChange={(e) => setGender(e.target.value as PersonDTO["gender"])}
          >
            <option value="UNKNOWN">Sin especificar</option>
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-bark-600">Nacimiento</label>
          <input
            type="date"
            className={inputCls}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-bark-600">Lugar de nacimiento</label>
        <input
          className={inputCls}
          value={birthPlace}
          onChange={(e) => setBirthPlace(e.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-bark-700">
        <input
          type="checkbox"
          checked={isLiving}
          onChange={(e) => setIsLiving(e.target.checked)}
        />
        Persona viva
      </label>
      <div>
        <label className="text-xs text-bark-600">Notas / anécdota breve</label>
        <textarea
          className={inputCls}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-bark-200 px-4 py-2 text-sm font-semibold text-bark-700 hover:bg-bark-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
