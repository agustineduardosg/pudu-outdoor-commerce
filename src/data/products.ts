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
};

export const products: Product[] = [
  {
    slug: "shell-ventisquero",
    sku: "PUD-SHV-001",
    name: "Shell Ventisquero",
    category: "Protección exterior",
    price: 189_990,
    color: "Bosque profundo",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Una capa exterior limpia y articulada para moverse con comodidad cuando el clima cambia.",
    details: ["Capucha regulable", "Corte articulado", "Bolsillos protegidos"],
    spriteIndex: 0,
    featured: true,
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
  },
  {
    slug: "polar-coihue",
    sku: "PUD-PLC-003",
    name: "Polar Coihue",
    category: "Capa intermedia",
    price: 94_990,
    color: "Mineral",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Una capa intermedia versátil, cálida al tacto y fácil de combinar en un sistema de capas.",
    details: ["Cuello alto", "Textura estructurada", "Cierre completo"],
    spriteIndex: 2,
    featured: true,
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
      "Pantalón técnico de silueta precisa, con espacio para moverse y una presencia discreta.",
    details: ["Rodillas articuladas", "Bolsillos seguros", "Ajuste en cintura"],
    spriteIndex: 4,
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
  },
  {
    slug: "polera-merino-pudu",
    sku: "PUD-PMP-007",
    name: "Polera Merino Pudú",
    category: "Primera capa",
    price: 54_990,
    color: "Bosque",
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Una polera esencial de tacto natural y diseño silencioso para el uso cotidiano.",
    details: ["Cuello reforzado", "Corte regular", "Terminaciones limpias"],
    spriteIndex: 6,
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
  },
];

export const featuredProducts = products.filter((product) => product.featured);

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
