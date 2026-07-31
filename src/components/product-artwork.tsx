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
    <div
      className={`product-artwork ${className}`}
      role="img"
      aria-label={`${product.name}, imagen conceptual de producto`}
      data-priority={priority ? "true" : "false"}
      style={{
        backgroundImage: `url('/images/product-${product.slug}.webp')`,
      }}
    />
  );
}
