import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edificio Central — Universidad Técnica del Norte",
  description: "Portal de noticias, eventos y actividades del Edificio Central de la UTN. Mantente informado sobre las últimas novedades académicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
