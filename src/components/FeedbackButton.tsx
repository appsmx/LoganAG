"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none";

/**
 * Botón flotante "Enviar comentarios" (estándar obligatorio del ecosistema LOGAN).
 * Incluye honeypot anti-spam y consentimiento LFPDPPP si se capturan nombre/correo.
 */
export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"SUGERENCIA" | "ERROR" | "OTRO">("SUGERENCIA");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharingPII = name.trim() !== "" || email.trim() !== "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (sharingPII && !consent) {
      setError("Marca la casilla de consentimiento para incluir tu nombre o correo.");
      return;
    }
    setSending(true);
    const res = await fetch("/api/public/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message, name, email, website }),
    });
    setSending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo enviar.");
      return;
    }
    setDone(true);
  }

  function reset() {
    setOpen(false);
    setDone(false);
    setMessage("");
    setName("");
    setEmail("");
    setConsent(false);
    setType("SUGERENCIA");
    setError(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-leaf-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-leaf-700"
        aria-label="Enviar comentarios"
      >
        💬 Comentarios
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            {done ? (
              <div className="text-center">
                <p className="text-lg font-semibold text-leaf-700">¡Gracias! 🌳</p>
                <p className="mt-2 text-sm text-bark-600">
                  Recibimos tus comentarios. Nos ayudan a mejorar LoganAG.
                </p>
                <button
                  onClick={reset}
                  className="mt-4 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-bark-900">Enviar comentarios</h2>
                  <button type="button" onClick={reset} className="text-bark-400 hover:text-bark-700">
                    ✕
                  </button>
                </div>

                <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                  <option value="SUGERENCIA">Sugerencia</option>
                  <option value="ERROR">Reportar un error</option>
                  <option value="OTRO">Otro</option>
                </select>

                <textarea
                  className={inputCls}
                  rows={4}
                  placeholder="Cuéntanos qué piensas…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />

                <input className={inputCls} placeholder="Tu nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={inputCls} type="email" placeholder="Tu correo (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />

                {/* honeypot oculto anti-spam */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {sharingPII && (
                  <label className="flex items-start gap-2 text-xs text-bark-600">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                    <span>
                      Acepto que LoganAG use mi nombre y correo para dar seguimiento a este
                      comentario, conforme al aviso de privacidad (LFPDPPP).
                    </span>
                  </label>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-lg bg-leaf-600 px-4 py-2 font-semibold text-white hover:bg-leaf-700 disabled:opacity-60"
                >
                  {sending ? "Enviando…" : "Enviar"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
