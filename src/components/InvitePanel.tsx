"use client";

import { useCallback, useEffect, useState } from "react";

interface Membership {
  id: string;
  role: "OWNER" | "COLLABORATOR" | "VIEWER";
  user: { email: string; name: string | null };
}
interface Invitation {
  id: string;
  email: string;
  role: "COLLABORATOR" | "VIEWER";
}

const roleLabel: Record<string, string> = {
  OWNER: "Dueño",
  COLLABORATOR: "Colaborador",
  VIEWER: "Lector",
};

const inputCls =
  "w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none";

export default function InvitePanel({ onClose }: { onClose: () => void }) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [myRole, setMyRole] = useState<string>("VIEWER");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"COLLABORATOR" | "VIEWER">("VIEWER");
  const [msg, setMsg] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/invitations", { cache: "no-store" });
    const data = await res.json();
    setMemberships(data.memberships ?? []);
    setInvitations(data.invitations ?? []);
    setMyRole(data.myRole ?? "VIEWER");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setDevLink(null);
    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error ?? "No se pudo invitar.");
      return;
    }
    setMsg(`Invitación enviada a ${email}.`);
    setEmail("");
    if (data.devLink) setDevLink(data.devLink);
    await load();
  }

  async function revoke(id: string) {
    await fetch(`/api/invitations?id=${id}`, { method: "DELETE" });
    await load();
  }

  const isOwner = myRole === "OWNER";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-bark-900">Familia e invitaciones</h2>
        <button onClick={onClose} className="text-sm text-bark-500 hover:text-bark-800">
          ✕
        </button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-bark-800">Miembros</h3>
        <ul className="mt-1 space-y-1 text-sm">
          {memberships.map((m) => (
            <li key={m.id} className="flex justify-between rounded border border-bark-200 bg-white px-2 py-1">
              <span className="text-bark-800">{m.user.name ?? m.user.email}</span>
              <span className="text-xs text-leaf-700">{roleLabel[m.role]}</span>
            </li>
          ))}
        </ul>
      </div>

      {isOwner ? (
        <>
          <form onSubmit={invite} className="space-y-2 rounded-lg border border-bark-200 bg-white p-3">
            <h3 className="text-sm font-semibold text-bark-800">Invitar a un familiar</h3>
            <input
              type="email"
              className={inputCls}
              placeholder="correo@familia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as "COLLABORATOR" | "VIEWER")}>
              <option value="VIEWER">Lector (solo ver)</option>
              <option value="COLLABORATOR">Colaborador (puede editar)</option>
            </select>
            <button type="submit" className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700">
              Enviar invitación
            </button>
            {msg && <p className="text-sm text-leaf-700">{msg}</p>}
            {devLink && (
              <p className="break-all text-xs text-bark-600">
                Modo desarrollo: <a href={devLink} className="underline">{devLink}</a>
              </p>
            )}
          </form>

          {invitations.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-bark-800">Pendientes</h3>
              <ul className="mt-1 space-y-1 text-sm">
                {invitations.map((inv) => (
                  <li key={inv.id} className="flex justify-between rounded border border-bark-200 bg-white px-2 py-1">
                    <span className="text-bark-700">{inv.email}</span>
                    <button onClick={() => revoke(inv.id)} className="text-xs text-red-500 hover:underline">
                      Revocar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-xs text-bark-500">
          Solo el dueño del árbol puede invitar a más familiares.
        </p>
      )}
    </div>
  );
}
