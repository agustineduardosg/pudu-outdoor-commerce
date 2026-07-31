import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PUDU Outdoor",
    short_name: "PUDU",
    description: "Ropa outdoor chilena de presencia silenciosa.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F1E9",
    theme_color: "#111311",
    icons: [
      {
        src: "/images/pudu-logo-master.webp",
        sizes: "1254x1254",
        type: "image/png",
      },
    ],
  };
}
