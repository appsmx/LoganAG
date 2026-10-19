"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface Feedback {
  id: string;
  type: "SUGERENCIA" | "ERROR" | "OTRO";
  message: string;
  name: string | null;
  email: string | null;
  status: "NUEVO" | "ATENDIDO";
  createdAt: string;
}

const typeLabel: Record<string, string> = {
  SUGERENCIA: "Sugerencia",
  ERROR: "Error",
  OTRO: "Otro",
};

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/feedback", { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo cargar.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setItems(data.feedback ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(id: string) {
    await fetch(`/api/admin/feedback?id=${id}`, { method: "PATCH" });
    await load();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/arbol" className="text-sm text-leaf-600 hover:underline">
        ← Volver al árbol
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-bark-900">
        Comentarios recibidos
      </h1>

      {loading ? (
        <p className="mt-6 text-bark-600">Cargando…</p>
      ) : error ? (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-bark-600">Aún no hay comentarios.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((f) => (
            <li
              key={f.id}
              className="rounded-lg border border-bark-200 bg-white p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-leaf-100 px-2 py-0.5 text-xs font-semibold text-leaf-700">
                  {typeLabel[f.type]}
                </span>
                <button
                  onClick={() => toggle(f.id)}
                  className={
                    f.status === "NUEVO"
                      ? "rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
                      : "rounded bg-bark-100 px-2 py-0.5 text-xs font-semibold text-bark-600"
                  }
                >
                  {f.status === "NUEVO"
                    ? "Nuevo · marcar atendido"
                    : "Atendido"}
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-bark-800">
                {f.message}
              </p>
              {(f.name || f.email) && (
                <p className="mt-2 text-xs text-bark-500">
                  {f.name} {f.email ? `· ${f.email}` : ""}
                </p>
              )}
              <p className="mt-1 text-xs text-bark-400">
                {new Date(f.createdAt).toLocaleString("es-MX")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
