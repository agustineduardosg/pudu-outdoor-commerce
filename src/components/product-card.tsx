import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/products";
import { formatCLP } from "@/data/products";
import { ProductArtwork } from "./product-artwork";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/producto/${product.slug}`} className="product-card__visual">
        <ProductArtwork product={product} />
        <span className="product-card__badge">Edición conceptual</span>
      </Link>
      <div className="product-card__body">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h3>
            <Link href={`/producto/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>
        <div className="product-card__meta">
          <span>{formatCLP(product.price)}</span>
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
