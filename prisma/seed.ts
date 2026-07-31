import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "shell-ventisquero",
    baseSku: "PUD-SHV-001",
    name: "Softshell Austral",
    subtitle: "Protección exterior",
    priceClp: 99990,
    featured: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorName: "Bosque profundo",
    colorHex: "#24362B",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "parka-austral",
    baseSku: "PUD-PKA-002",
    name: "Parka Austral",
    subtitle: "Abrigo",
    priceClp: 219990,
    featured: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorName: "Obsidiana",
    colorHex: "#111311",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "polar-coihue",
    baseSku: "PUD-PLC-003",
    name: "Polar Lenga",
    subtitle: "Capa intermedia",
    priceClp: 74990,
    featured: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorName: "Mineral",
    colorHex: "#777A74",
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    slug: "primera-capa-nothofagus",
    baseSku: "PUD-PCN-004",
    name: "Primera Capa Nothofagus",
    subtitle: "Primera capa",
    priceClp: 69990,
    featured: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorName: "Hueso",
    colorHex: "#F4F1E9",
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    slug: "pantalon-travesia",
    baseSku: "PUD-PTR-005",
    name: "Pantalón Travesía",
    subtitle: "Pantalones",
    priceClp: 119990,
    featured: false,
    sizes: ["36", "38", "40", "42", "44", "46"],
    colorName: "Obsidiana",
    colorHex: "#111311",
  },
  {
    id: "66666666-6666-4666-8666-666666666666",
    slug: "cortaviento-magallanes",
    baseSku: "PUD-CVM-006",
    name: "Cortaviento Magallanes",
    subtitle: "Protección ligera",
    priceClp: 109990,
    featured: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorName: "Glaciar",
    colorHex: "#B8D2D2",
  },
  {
    id: "77777777-7777-4777-8777-777777777777",
    slug: "polera-merino-pudu",
    baseSku: "PUD-PMP-007",
    name: "Polera Merino Pudú",
    subtitle: "Primera capa",
    priceClp: 54990,
    featured: false,
    sizes: ["XS", "S", "M", "L", "XL"],
    colorName: "Bosque",
    colorHex: "#24362B",
  },
  {
    id: "88888888-8888-4888-8888-888888888888",
    slug: "gorro-alerce",
    baseSku: "PUD-GAL-008",
    name: "Gorro Alerce",
    subtitle: "Accesorios",
    priceClp: 29990,
    featured: false,
    sizes: ["Única"],
    colorName: "Carbón",
    colorHex: "#303331",
  },
] as const;

async function main() {
  const collection = await prisma.collection.upsert({
    where: { slug: "cordillera-sur" },
    update: { name: "Cordillera Sur", active: true },
    create: {
      slug: "cordillera-sur",
      name: "Cordillera Sur",
      summary: "Colección conceptual PUDU. Contenido reemplazable.",
      active: true,
    },
  });

  const zones = [
    { code: "RM", name: "Región Metropolitana", priceClp: 4990, free: 120000 },
    { code: "CENTRO", name: "Zona Centro", priceClp: 6990, free: 140000 },
    { code: "SUR", name: "Zona Sur", priceClp: 8990, free: 150000 },
  ];
  for (const zone of zones) {
    await prisma.shippingZone.upsert({
      where: { code: zone.code },
      update: {
        name: zone.name,
        priceClp: zone.priceClp,
        freeAboveClp: zone.free,
        active: true,
      },
      create: {
        code: zone.code,
        name: zone.name,
        communes: [],
        priceClp: zone.priceClp,
        freeAboveClp: zone.free,
        active: true,
      },
    });
  }

  for (const [productIndex, product] of products.entries()) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        baseSku: product.baseSku,
        name: product.name,
        subtitle: product.subtitle,
        priceClp: product.priceClp,
        featured: product.featured,
        status: "ACTIVE",
        sortOrder: productIndex,
        collectionId: collection.id,
      },
      create: {
        id: product.id,
        slug: product.slug,
        baseSku: product.baseSku,
        name: product.name,
        subtitle: product.subtitle,
        description:
          "Producto conceptual PUDU. Materiales, construcción y prestaciones deben confirmarse antes de su publicación comercial.",
        priceClp: product.priceClp,
        featured: product.featured,
        status: "ACTIVE",
        sortOrder: productIndex,
        collectionId: collection.id,
      },
    });

    await prisma.productMedia.deleteMany({ where: { productId: saved.id } });
    await prisma.productMedia.create({
      data: {
        productId: saved.id,
        url: `/images/product-${product.slug}.webp`,
        altText: `${product.name}, imagen conceptual provisional`,
        provisional: true,
      },
    });

    for (const size of product.sizes) {
      const sku = `${product.baseSku}-${size === "Única" ? "UNICA" : size}`;
      await prisma.productVariant.upsert({
        where: { sku },
        update: {
          productId: saved.id,
          size,
          colorName: product.colorName,
          colorHex: product.colorHex,
          active: true,
        },
        create: {
          sku,
          productId: saved.id,
          size,
          colorName: product.colorName,
          colorHex: product.colorHex,
          active: true,
          stockOnHand: size === "Única" ? 18 : 12,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    // Keep logs free of connection strings and record payloads.
    console.error(
      "No fue posible cargar los datos conceptuales:",
      error instanceof Error ? error.name : "UnknownError",
    );
    await prisma.$disconnect();
    process.exit(1);
  });
