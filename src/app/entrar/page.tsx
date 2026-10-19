"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function EntrarInner() {
  const params = useSearchParams();
  const urlError = params.get("error");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    urlError === "invalid"
      ? "El enlace no es válido o ya caducó. Solicita uno nuevo."
      : urlError === "missing"
        ? "Falta el token del enlace."
        : null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSending(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar el enlace.");
      return;
    }
    setSent(true);
    if (data.devLink) setDevLink(data.devLink);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <Link href="/" className="mb-6 text-sm text-leaf-600 hover:underline">
        ← Inicio
      </Link>
      <h1 className="text-3xl font-bold text-bark-900">Entrar a LoganAG 🌳</h1>
      <p className="mt-2 text-sm text-bark-600">
        Te enviamos un enlace mágico a tu correo. Sin contraseñas.
      </p>

      {!sent ? (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            placeholder="tu@correo.com"
            className="w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm focus:border-leaf-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-leaf-600 px-4 py-2 font-semibold text-white hover:bg-leaf-700 disabled:opacity-60"
          >
            {sending ? "Enviando…" : "Enviarme el enlace"}
          </button>
        </form>
      ) : (
        <div className="mt-6 rounded-lg border border-leaf-400 bg-leaf-100 p-4 text-sm text-leaf-700">
          <p>Revisa tu correo y abre el enlace para entrar.</p>
          {devLink && (
            <p className="mt-3 break-all">
              <span className="font-semibold">Modo desarrollo:</span>{" "}
              <a href={devLink} className="underline">
                {devLink}
              </a>
            </p>
          )}
        </div>
      )}
    </main>
  );
}

export default function EntrarPage() {
  return (
    <Suspense fallback={<main className="p-8">Cargando…</main>}>
      <EntrarInner />
    </Suspense>
  );
}
