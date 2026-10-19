// Envío de correo vía Brevo (estándar del ecosistema LOGAN).
// En desarrollo, si no hay BREVO_API_KEY, el correo se registra en consola y la
// función devuelve el contenido para poder probar sin servicio real (DEC-010).

import { escapeHtml } from "./utils";

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendMailResult {
  delivered: boolean;
  devPreview?: { to: string; subject: string; text: string };
}

export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.MAIL_FROM ?? "LoganAG <no-reply@loganag.local>";

  if (!apiKey) {
    // Modo desarrollo: no se envía nada real.
    console.info("[mailer:dev] correo simulado →", input.to, "·", input.subject);
    console.info("[mailer:dev] contenido:\n", input.text);
    return {
      delivered: false,
      devPreview: { to: input.to, subject: input.subject, text: input.text },
    };
  }

  const { name, email } = parseFrom(from);

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name, email },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
      textContent: input.text,
    }),
  });

  if (!res.ok) {
    console.error("[mailer] Brevo respondió", res.status);
    return { delivered: false };
  }
  return { delivered: true };
}

function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^(.*)<(.+)>$/);
  if (match) return { name: match[1].trim(), email: match[2].trim() };
  return { name: "LoganAG", email: from.trim() };
}

/** Plantilla del correo de enlace mágico. Escapa el contenido dinámico. */
export function magicLinkEmail(link: string): { html: string; text: string } {
  const safeLink = escapeHtml(link);
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#386027">LoganAG 🌳</h2>
      <p>Hola, aquí está tu enlace para entrar a tu árbol genealógico:</p>
      <p style="margin:24px 0">
        <a href="${safeLink}" style="background:#4a7a34;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
          Entrar a LoganAG
        </a>
      </p>
      <p style="color:#6b4420;font-size:13px">El enlace caduca en 15 minutos y solo puede usarse una vez. Si no lo solicitaste, ignora este correo.</p>
    </div>`;
  const text = `Entra a LoganAG con este enlace (caduca en 15 min, un solo uso):\n${link}`;
  return { html, text };
}

/** Plantilla del correo de invitación familiar (DEC-011). */
export function invitationEmail(
  link: string,
  treeName: string,
  inviterName: string
): { html: string; text: string } {
  const safeLink = escapeHtml(link);
  const safeTree = escapeHtml(treeName);
  const safeInviter = escapeHtml(inviterName);
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#386027">LoganAG 🌳</h2>
      <p><strong>${safeInviter}</strong> te invitó a colaborar en el árbol genealógico <strong>${safeTree}</strong>.</p>
      <p style="margin:24px 0">
        <a href="${safeLink}" style="background:#4a7a34;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">
          Aceptar invitación
        </a>
      </p>
      <p style="color:#6b4420;font-size:13px">Si no esperabas esta invitación, puedes ignorar este correo.</p>
    </div>`;
  const text = `${inviterName} te invitó al árbol "${treeName}" en LoganAG.\nAcepta aquí: ${link}`;
  return { html, text };
}
