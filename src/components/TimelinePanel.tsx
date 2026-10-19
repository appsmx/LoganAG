"use client";

import { useEffect, useState } from "react";
import type { TimelineEvent } from "@/lib/timeline";

const typeIcon: Record<string, string> = {
  BIRTH: "👶",
  DEATH: "🕊️",
  MILESTONE: "🏅",
  STORY: "📖",
  KEY_POINT: "⭐",
};

export default function TimelinePanel({ onClose }: { onClose: () => void }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/timeline", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-bark-900">Línea de tiempo 🕰️</h2>
        <button
          onClick={onClose}
          className="text-sm text-bark-500 hover:text-bark-800"
        >
          ✕
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-bark-500">Cargando…</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-bark-500">
          Aún no hay eventos con fecha. Agrega fechas de nacimiento o anécdotas
          fechadas para construir la historia.
        </p>
      ) : (
        <ol className="relative space-y-3 border-l-2 border-bark-200 pl-4">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[22px] top-0.5 text-sm">
                {typeIcon[e.type] ?? "•"}
              </span>
              <div className="rounded-lg border border-bark-200 bg-white p-2 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-bark-900">{e.title}</span>
                  <span className="text-xs font-semibold text-leaf-700">
                    {e.year}
                  </span>
                </div>
                {e.detail && (
                  <p className="mt-1 whitespace-pre-wrap text-bark-700">
                    {e.detail}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
