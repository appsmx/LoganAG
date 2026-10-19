// Firma de subidas a Cloudinary (patrón del ecosistema LOGAN).
// El navegador sube el archivo DIRECTO a Cloudinary usando una firma generada en el
// servidor; así el API secret nunca viaja al cliente ni pasa por nuestro servidor.
//
// Variables de entorno:
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

import { createHash } from "crypto";

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Genera una firma para una subida restringida a una carpeta.
 * Cloudinary firma SHA-1 de los params ordenados + api_secret.
 */
export function signUpload(folder: string): UploadSignature | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  // params a firmar, en orden alfabético
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");

  return { cloudName, apiKey, timestamp, folder, signature };
}
