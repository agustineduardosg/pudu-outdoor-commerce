import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Colección 01",
  description:
    "Ocho piezas conceptuales para construir un sistema de capas PUDU.",
};

export default function CollectionPage() {
  return (
    <main id="contenido" tabIndex={-1} className="page-shell">
      <header className="collection-hero">
        <div>
          <p className="eyebrow">Colección 01 / Ocho piezas</p>
          <h1>Prepararse<br />sin exceso.</h1>
        </div>
        <p>
          Una primera colección conceptual para recorrer el sistema completo:
          base, abrigo, protección y accesorios.
        </p>
      </header>
      <div className="collection-filter" aria-label="Información de colección">
        <span>Todos los productos</span>
        <span>{products.length} piezas</span>
      </div>
      <div className="product-grid product-grid--all">
        {products.map((product) => (
          <ProductCard product={product} key={product.slug} />
        ))}
      </div>
    </main>
  );
}
