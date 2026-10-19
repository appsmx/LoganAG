import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoganAG — Tu árbol genealógico vivo",
  description:
    "Construye un árbol genealógico dinámico, interactivo y lleno de memoria, impulsado por inteligencia artificial. Metodología LOGAN.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-MX">
      <body className="min-h-screen bg-bark-50 text-bark-900">{children}</body>
    </html>
  );
}
