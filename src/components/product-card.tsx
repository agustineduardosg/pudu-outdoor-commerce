import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/products";
import { formatCLP } from "@/data/products";
import { ProductArtwork } from "./product-artwork";

export function ProductCard({
  product,
  headingLevel = 3,
  priority = false,
}: {
  product: Product;
  headingLevel?: 2 | 3;
  priority?: boolean;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className="product-card">
      <Link href={`/producto/${product.slug}`} className="product-card__visual">
        <ProductArtwork product={product} priority={priority} />
        <span className="product-card__badge">
          {product.availability === "available" ? "Disponible" : "Próximamente"}
        </span>
      </Link>
      <div className="product-card__body">
        <div>
          <p className="eyebrow">{product.category}</p>
          <Heading>
            <Link href={`/producto/${product.slug}`}>{product.name}</Link>
          </Heading>
        </div>
        <div className="product-card__meta">
          <span>
            <small>Precio ref.</small>
            {formatCLP(product.price)}
          </span>
          <Link
            href={`/producto/${product.slug}`}
            aria-label={`Ver ${product.name}`}
          >
            <ArrowUpRight aria-hidden="true" size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
