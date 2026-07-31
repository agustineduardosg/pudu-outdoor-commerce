import type { MetadataRoute } from "next";

function origin() {
  return process.env.APP_ORIGIN ?? "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/carrito", "/checkout", "/pedido/"],
    },
    sitemap: `${origin()}/sitemap.xml`,
  };
}
