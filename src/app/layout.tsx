import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-provider";
import { PublicChrome } from "@/components/public-chrome";
import "@fontsource-variable/manrope";
import "@fontsource/barlow-condensed/600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN ?? "http://localhost:3000"),
  title: {
    default: "PUDU Ruta 500 — El camino se comparte",
    template: "%s · PUDU Outdoor",
  },
  description:
    "Conoce PUDU Ruta 500, un set de termo de 500 ml y tres tazas actualmente en validación para su lanzamiento en Chile.",
  keywords: [
    "termo outdoor Chile",
    "termo 500 ml",
    "set termo tres tazas",
    "PUDU Outdoor",
    "accesorios outdoor",
  ],
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "PUDU Outdoor",
    title: "PUDU Ruta 500 — El camino se comparte",
    description:
      "Un termo de 500 ml y tres tazas para compartir el camino. Concepto en validación.",
    images: [
      {
        url: "/images/pudu-ruta-500-hero-v1.png",
        width: 1056,
        height: 1320,
        alt: "Concepto PUDU Ruta 500 en color bosque con tres tazas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PUDU Ruta 500 — El camino se comparte",
    description:
      "Un termo de 500 ml y tres tazas para compartir el camino. Concepto en validación.",
    images: ["/images/pudu-ruta-500-hero-v1.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111311",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <PublicChrome>{children}</PublicChrome>
        </CartProvider>
      </body>
    </html>
  );
}
