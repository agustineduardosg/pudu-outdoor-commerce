import Image from "next/image";
import type { Product } from "@/data/products";

export function ProductArtwork({
  product,
  className = "",
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`product-artwork ${product.artwork ? "product-artwork--catalog" : ""} ${className}`}>
      <Image
        src={product.artwork ?? `/images/product-${product.slug}.webp`}
        alt={`${product.name}, imagen conceptual de producto`}
        fill
        preload={priority}
        sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
      />
    </div>
  );
}
