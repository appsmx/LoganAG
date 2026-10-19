"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [state, setState] = useState<
    "idle" | "accepting" | "done" | "needsAuth" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function accept() {
    setState("accepting");
    const res = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && data.needsAuth) {
      setState("needsAuth");
      return;
    }
    if (!res.ok) {
      setState("error");
      setMessage(data.error ?? "No se pudo aceptar la invitación.");
      return;
    }
    setState("done");
    setTimeout(() => router.push("/arbol"), 1200);
  }

  useEffect(() => {
    accept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-bark-900">Invitación familiar 🌳</h1>

      {state === "accepting" && (
        <p className="mt-4 text-bark-600">Aceptando invitación…</p>
      )}
      {state === "done" && (
        <p className="mt-4 text-leaf-700">
          ¡Listo! Ya tienes acceso al árbol. Redirigiendo…
        </p>
      )}
      {state === "needsAuth" && (
        <div className="mt-4 space-y-3">
          <p className="text-bark-600">
            Primero inicia sesión; luego vuelve a abrir este enlace para aceptar.
          </p>
          <Link
            href="/entrar"
            className="inline-block rounded-lg bg-leaf-600 px-4 py-2 font-semibold text-white hover:bg-leaf-700"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
      {state === "error" && (
        <p className="mt-4 text-red-600">{message}</p>
      )}
    </main>
  );
}
