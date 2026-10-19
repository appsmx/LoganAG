"use client";

import { useState } from "react";

/**
 * Carga de imagen a Cloudinary con subida firmada (sin exponer secretos).
 * Devuelve la URL segura resultante vía onUploaded. Si Cloudinary no está
 * configurado, muestra un aviso y permite pegar una URL manualmente.
 */
export default function ImageUpload({
  value,
  onUploaded,
}: {
  value: string | null;
  onUploaded: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      const signRes = await fetch("/api/uploads/sign", { method: "POST" });
      if (signRes.status === 503) {
        setManual(true);
        setError(
          "La carga de fotos no está configurada; pega una URL de imagen."
        );
        return;
      }
      if (!signRes.ok) throw new Error("sign");
      const sig = await signRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", sig.apiKey);
      form.append("timestamp", String(sig.timestamp));
      form.append("folder", sig.folder);
      form.append("signature", sig.signature);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: form }
      );
      if (!upRes.ok) throw new Error("upload");
      const data = await upRes.json();
      onUploaded(data.secure_url as string);
    } catch {
      setError("No se pudo subir la imagen. Intenta de nuevo o pega una URL.");
      setManual(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="foto"
            className="h-14 w-14 rounded-full object-cover"
          />
          <button
            type="button"
            onClick={() => onUploaded(null)}
            className="text-xs text-red-500 hover:underline"
          >
            Quitar
          </button>
        </div>
      )}

      {!manual ? (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-bark-200 bg-white px-3 py-1.5 text-xs font-semibold text-bark-700 hover:bg-bark-100">
          {uploading ? "Subiendo…" : "📷 Subir foto"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      ) : (
        <input
          type="url"
          placeholder="https://…/foto.jpg"
          defaultValue={value ?? ""}
          onBlur={(e) => onUploaded(e.target.value.trim() || null)}
          className="w-full rounded-lg border border-bark-200 bg-white px-3 py-2 text-sm text-bark-900 focus:border-leaf-400 focus:outline-none"
        />
      )}

      {error && <p className="text-xs text-amber-600">{error}</p>}
    </div>
  );
}
