import "server-only";

import type { ProductDto } from "@/types/commerce";

type ConceptProduct = Omit<ProductDto, "id"> & { id: string };

const collection = { slug: "cordillera-sur", name: "Cordillera Sur" };

function media(name: string, slug: string): ProductDto["media"] {
  return [
    {
      url: `/images/product-${slug}.webp`,
      alt: `${name}, imagen conceptual provisional`,
      provisional: true,
    },
  ];
}

function variants(input: {
  baseSku: string;
  sizes: readonly string[];
  colorName: string;
  colorHex: string;
}): ProductDto["variants"] {
  return input.sizes.map((size) => ({
    sku: `${input.baseSku}-${size === "Única" ? "UNICA" : size}`,
    size,
    colorName: input.colorName,
    colorHex: input.colorHex,
    available: true,
    availableQuantity: size === "Única" ? 18 : 12,
  }));
}

export const conceptualProducts: ConceptProduct[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "shell-ventisquero",
    baseSku: "PUD-SHV-001",
    name: "Shell Ventisquero",
    subtitle: "Protección exterior",
    description:
      "Una capa exterior limpia y articulada para moverse con comodidad cuando el clima cambia. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 189990,
    compareAtClp: null,
    featured: true,
    collection,
    media: media("Shell Ventisquero", "shell-ventisquero"),
    variants: variants({
      baseSku: "PUD-SHV-001",
      sizes: ["XS", "S", "M", "L", "XL"],
      colorName: "Bosque profundo",
      colorHex: "#24362B",
    }),
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "parka-austral",
    baseSku: "PUD-PKA-002",
    name: "Parka Austral",
    subtitle: "Abrigo",
    description:
      "Abrigo envolvente de líneas sobrias, pensado para jornadas frías dentro y fuera de la ciudad. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 219990,
    compareAtClp: null,
    featured: true,
    collection,
    media: media("Parka Austral", "parka-austral"),
    variants: variants({
      baseSku: "PUD-PKA-002",
      sizes: ["XS", "S", "M", "L", "XL"],
      colorName: "Obsidiana",
      colorHex: "#111311",
    }),
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "polar-coihue",
    baseSku: "PUD-PLC-003",
    name: "Polar Coihue",
    subtitle: "Capa intermedia",
    description:
      "Una capa intermedia versátil, cálida al tacto y fácil de combinar en un sistema de capas. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 94990,
    compareAtClp: null,
    featured: true,
    collection,
    media: media("Polar Coihue", "polar-coihue"),
    variants: variants({
      baseSku: "PUD-PLC-003",
      sizes: ["XS", "S", "M", "L", "XL"],
      colorName: "Mineral",
      colorHex: "#777A74",
    }),
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "primera-capa-nothofagus",
    baseSku: "PUD-PCN-004",
    name: "Primera Capa Nothofagus",
    subtitle: "Primera capa",
    description:
      "Base de manga larga con calce cercano y costuras limpias para usar sola o bajo otras capas. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 69990,
    compareAtClp: null,
    featured: true,
    collection,
    media: media("Primera Capa Nothofagus", "primera-capa-nothofagus"),
    variants: variants({
      baseSku: "PUD-PCN-004",
      sizes: ["XS", "S", "M", "L", "XL"],
      colorName: "Hueso",
      colorHex: "#F4F1E9",
    }),
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "pantalon-travesia",
    baseSku: "PUD-PTR-005",
    name: "Pantalón Travesía",
    subtitle: "Pantalones",
    description:
      "Pantalón de silueta precisa, con espacio para moverse y una presencia discreta. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 119990,
    compareAtClp: null,
    featured: false,
    collection,
    media: media("Pantalón Travesía", "pantalon-travesia"),
    variants: variants({
      baseSku: "PUD-PTR-005",
      sizes: ["36", "38", "40", "42", "44", "46"],
      colorName: "Obsidiana",
      colorHex: "#111311",
    }),
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "cortaviento-magallanes",
    baseSku: "PUD-CVM-006",
    name: "Cortaviento Magallanes",
    subtitle: "Protección ligera",
    description:
      "Capa liviana y compacta para sumar protección sin sobrecargar el sistema. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 109990,
    compareAtClp: null,
    featured: false,
    collection,
    media: media("Cortaviento Magallanes", "cortaviento-magallanes"),
    variants: variants({
      baseSku: "PUD-CVM-006",
      sizes: ["XS", "S", "M", "L", "XL"],
      colorName: "Glaciar",
      colorHex: "#B8D2D2",
    }),
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    slug: "polera-merino-pudu",
    baseSku: "PUD-PMP-007",
    name: "Polera Merino Pudú",
    subtitle: "Primera capa",
    description:
      "Una polera esencial de tacto natural y diseño silencioso para el uso cotidiano. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 54990,
    compareAtClp: null,
    featured: false,
    collection,
    media: media("Polera Merino Pudú", "polera-merino-pudu"),
    variants: variants({
      baseSku: "PUD-PMP-007",
      sizes: ["XS", "S", "M", "L", "XL"],
      colorName: "Bosque",
      colorHex: "#24362B",
    }),
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    slug: "gorro-alerce",
    baseSku: "PUD-GAL-008",
    name: "Gorro Alerce",
    subtitle: "Accesorios",
    description:
      "Gorro tejido de ajuste cómodo, creado para acompañar las capas de la colección. Producto conceptual sujeto a ficha técnica definitiva.",
    priceClp: 29990,
    compareAtClp: null,
    featured: false,
    collection,
    media: media("Gorro Alerce", "gorro-alerce"),
    variants: variants({
      baseSku: "PUD-GAL-008",
      sizes: ["Única"],
      colorName: "Carbón",
      colorHex: "#303331",
    }),
  },
];

export const demoShippingZones = [
  {
    code: "RM",
    name: "Región Metropolitana",
    priceClp: 4990,
    freeAboveClp: 120000,
  },
  {
    code: "CENTRO",
    name: "Zona Centro",
    priceClp: 6990,
    freeAboveClp: 140000,
  },
  {
    code: "SUR",
    name: "Zona Sur",
    priceClp: 8990,
    freeAboveClp: 150000,
  },
] as const;
