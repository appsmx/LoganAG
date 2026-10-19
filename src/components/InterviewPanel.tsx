"use client";

import { useState } from "react";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Entrevista guiada por IA (P2). La IA hace una pregunta a la vez; el usuario
 * responde y recibe la siguiente. Las respuestas quedan como notas que el usuario
 * puede luego capturar manualmente (la entrevista no persiste datos por sí sola).
 */
export default function InterviewPanel({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<Turn[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  async function ask(nextHistory: Turn[]) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ai/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: nextHistory }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "No se pudo continuar la entrevista.");
      return;
    }
    setQuestion(data.question);
    setHint(data.hint ?? null);
    setHistory([...nextHistory, { role: "assistant", content: data.question }]);
  }

  async function start() {
    setStarted(true);
    await ask([]);
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    const nextHistory: Turn[] = [
      ...history,
      { role: "user", content: answer.trim() },
    ];
    setAnswer("");
    await ask(nextHistory);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-bark-900">
          🤖 Entrevista de recuerdos
        </h2>
        <button
          onClick={onClose}
          className="text-sm text-bark-500 hover:text-bark-800"
        >
          ✕
        </button>
      </div>

      <p className="rounded bg-leaf-100 p-2 text-xs text-leaf-700">
        La IA te hará preguntas para ayudarte a recordar y llenar huecos. Tus
        respuestas te sirven de guía; captura los datos en las fichas cuando
        quieras.
      </p>

      {!started ? (
        <button
          onClick={start}
          className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
        >
          Empezar entrevista
        </button>
      ) : (
        <>
          {/* historial */}
          <div className="max-h-56 space-y-2 overflow-auto">
            {history.map((t, i) => (
              <div
                key={i}
                className={
                  t.role === "assistant"
                    ? "rounded-lg bg-white border border-bark-200 p-2 text-sm text-bark-800"
                    : "rounded-lg bg-bark-100 p-2 text-sm text-bark-700"
                }
              >
                <span className="mr-1 text-xs font-semibold">
                  {t.role === "assistant" ? "🤖" : "Tú:"}
                </span>
                {t.content}
              </div>
            ))}
          </div>

          {hint && !loading && (
            <p className="text-xs italic text-bark-500">💡 {hint}</p>
          )}

          {loading && <p className="text-sm text-bark-500">Pensando…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {question && !loading && (
            <form onSubmit={submitAnswer} className="space-y-2">
              <textarea
                className="w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none"
                rows={2}
                placeholder="Tu respuesta…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
              >
                Responder y continuar
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
