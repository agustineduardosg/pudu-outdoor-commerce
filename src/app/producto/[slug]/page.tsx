import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { getProduct, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = products.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <main id="contenido" tabIndex={-1} className="product-page">
      <section className="product-main">
        <ProductGallery product={product} />
        <ProductPurchase product={product} />
      </section>
      <section className="product-story section-shell">
        <p className="eyebrow">Pensada como sistema</p>
        <h2>{product.name} no trabaja sola.</h2>
        <p>
          Sus proporciones fueron planteadas para convivir con el resto de la
          Colección 01. Las combinaciones finales se verificarán con prototipos
          reales antes de publicar especificaciones de desempeño.
        </p>
      </section>
      <section className="section-shell related">
        <header className="section-heading">
          <div>
            <p className="eyebrow">Completa el sistema</p>
            <h2>Combina capas.</h2>
          </div>
        </header>
        <div className="product-grid product-grid--related">
          {related.map((item) => (
            <ProductCard product={item} key={item.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
