export type Product = {
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  color: string;
  sizes: string[];
  description: string;
  details: string[];
  spriteIndex: number;
  featured?: boolean;
  availability?: "available" | "coming-soon";
  artwork?: string;
  campaign?: {
    image: string;
    alt: string;
    scene: string;
  };
  designBoard?: {
    image: string;
    alt: string;
  };
};

export const products: Product[] = [
  {
    slug: "shell-ventisquero",
    sku: "PUD-SHV-001",
    name: "Softshell Austral",
    category: "Protección exterior / Mujer",
    price: 99_990,
    color: "Obsidiana / Glaciar",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Una silueta limpia y femenina para los cambios de clima entre ciudad, sendero y cordillera.",
    details: ["Capucha regulable", "Corte articulado", "Firma PUDU en manga"],
    spriteIndex: 0,
    featured: true,
    availability: "coming-soon",
    artwork: "/images/maite/softshell-austral-packshot.avif",
    campaign: {
      image: "/images/maite/maite-softshell-austral-snow.avif",
      alt: "Maite viste la Softshell Austral PUDU en un paisaje de cordillera nevada",
      scene: "Cordillera / Look 01",
    },
    designBoard: {
      image: "/images/maite/softshell-austral-ficha.avif",
      alt: "Ficha visual conceptual de la Softshell Austral PUDU",
    },
  },
  {
    slug: "parka-austral",
    sku: "PUD-PKA-002",
    name: "Parka Austral",
    category: "Abrigo",
    price: 219_990,
    color: "Obsidiana",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Abrigo envolvente de líneas sobrias, pensado para jornadas frías dentro y fuera de la ciudad.",
    details: ["Cuello envolvente", "Puños ajustables", "Largo protector"],
    spriteIndex: 1,
    featured: true,
    availability: "coming-soon",
  },
  {
    slug: "polar-coihue",
    sku: "PUD-PLC-003",
    name: "Polar Lenga",
    category: "Capa intermedia / Mujer",
    price: 74_990,
    color: "Hueso / Bosque",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Una capa intermedia de textura envolvente, creada para pasar del refugio al exterior sin cambiar de ritmo.",
    details: ["Cuello alto", "Bolsillo de contraste", "Firma PUDU posterior"],
    spriteIndex: 2,
    featured: true,
    availability: "coming-soon",
    artwork: "/images/maite/polar-lenga-packshot.avif",
    campaign: {
      image: "/images/maite/maite-polar-lenga-refugio.avif",
      alt: "Maite viste el Polar Lenga PUDU en un refugio de montaña",
      scene: "Refugio / Look 02",
    },
    designBoard: {
      image: "/images/maite/polar-lenga-ficha.avif",
      alt: "Ficha visual conceptual del Polar Lenga PUDU",
    },
  },
  {
    slug: "primera-capa-nothofagus",
    sku: "PUD-PCN-004",
    name: "Primera Capa Nothofagus",
    category: "Primera capa",
    price: 69_990,
    color: "Hueso",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Base de manga larga con calce cercano y costuras limpias para usar sola o bajo otras capas.",
    details: ["Calce anatómico", "Manga raglán", "Terminación suave"],
    spriteIndex: 3,
    featured: true,
    availability: "coming-soon",
  },
  {
    slug: "pantalon-travesia",
    sku: "PUD-PTR-005",
    name: "Pantalón Travesía",
    category: "Pantalones",
    price: 119_990,
    color: "Obsidiana",
    sizes: ["36", "38", "40", "42", "44", "46"],
    description:
      "Pantalón de silueta precisa, con espacio para moverse y una presencia discreta.",
    details: ["Rodillas articuladas", "Bolsillos seguros", "Ajuste en cintura"],
    spriteIndex: 4,
    availability: "coming-soon",
  },
  {
    slug: "cortaviento-magallanes",
    sku: "PUD-CVM-006",
    name: "Cortaviento Magallanes",
    category: "Protección ligera",
    price: 109_990,
    color: "Glaciar",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Capa liviana y compacta para sumar protección sin sobrecargar el sistema.",
    details: ["Construcción liviana", "Capucha integrada", "Puños elásticos"],
    spriteIndex: 5,
    availability: "coming-soon",
  },
  {
    slug: "polera-merino-pudu",
    sku: "PUD-PMP-007",
    name: "Polera Merino PUDU",
    category: "Primera capa",
    price: 54_990,
    color: "Bosque",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Una polera esencial de tacto natural y diseño silencioso para el uso cotidiano.",
    details: ["Cuello reforzado", "Corte regular", "Terminaciones limpias"],
    spriteIndex: 6,
    availability: "coming-soon",
  },
  {
    slug: "gorro-alerce",
    sku: "PUD-GAL-008",
    name: "Gorro Alerce",
    category: "Accesorios",
    price: 29_990,
    color: "Carbón",
    sizes: ["Única"],
    description:
      "Gorro tejido de ajuste cómodo, creado para acompañar las capas de la colección.",
    details: ["Tejido acanalado", "Doblez regulable", "Talla adaptable"],
    spriteIndex: 7,
    availability: "coming-soon",
  },
];

export const featuredProducts = products.filter((product) => product.featured);

export const brandedProducts = products.filter(
  (product) => Boolean(product.artwork && product.campaign && product.designBoard),
);

export function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getBrandedProduct(slug: string) {
  return brandedProducts.find((product) => product.slug === slug);
}
