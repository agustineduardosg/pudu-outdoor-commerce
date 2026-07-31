import type { MetadataRoute } from "next";
import { products } from "@/data/products";

const staticPaths = [
  "",
  "/coleccion",
  "/guia-de-tallas",
  "/envios-y-devoluciones",
  "/faq",
  "/contacto",
  "/terminos",
  "/privacidad",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${origin}/producto/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    ...staticPaths.map((path, index) => ({
      url: `${origin}${path}`,
      changeFrequency: index < 2 ? ("weekly" as const) : ("monthly" as const),
      priority: index === 0 ? 1 : index === 1 ? 0.9 : 0.5,
    })),
    ...productEntries,
  ];
}
