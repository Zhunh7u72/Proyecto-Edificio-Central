import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FEUE — Universidad Técnica del Norte",
  description: "Portal de noticias, eventos y actividades de la FEUE de la UTN. Mantente informado sobre las últimas novedades académicas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
