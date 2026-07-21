import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AgroPilot AI",
    template: "%s · AgroPilot AI",
  },
  description:
    "Plataforma de apoyo para decisiones agrícolas explicables y trazables.",
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
