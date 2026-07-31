import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/cart-provider";
import { PublicChrome } from "@/components/public-chrome";
import "@fontsource-variable/manrope";
import "@fontsource/barlow-condensed/600.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN ?? "http://localhost:3000"),
  title: {
    default: "PUDU Outdoor — Hecho para seguir",
    template: "%s · PUDU Outdoor",
  },
  description:
    "Ropa outdoor chilena de presencia silenciosa. Descubre la primera colección conceptual de PUDU.",
  keywords: [
    "ropa outdoor Chile",
    "PUDU Outdoor",
    "ropa técnica",
    "Patagonia",
    "chaquetas outdoor",
  ],
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "PUDU Outdoor",
    title: "PUDU Outdoor — Hecho para seguir",
    description:
      "Capas técnicas de presencia silenciosa, diseñadas en Chile.",
    images: [
      {
        url: "/images/pudu-hero-concept.webp",
        width: 1536,
        height: 1024,
        alt: "PUDU Outdoor en el paisaje patagónico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PUDU Outdoor — Hecho para seguir",
    description:
      "Capas técnicas de presencia silenciosa, diseñadas en Chile.",
    images: ["/images/pudu-hero-concept.webp"],
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
