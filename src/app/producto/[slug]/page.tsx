import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { brandedProducts, getBrandedProduct } from "@/data/products";

export function generateStaticParams() {
  return brandedProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getBrandedProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getBrandedProduct(slug);
  if (!product) notFound();
  const related = brandedProducts.filter((item) => item.slug !== slug);

  return (
    <main id="contenido" tabIndex={-1} className="product-page">
      <section className="product-main">
        <ProductGallery product={product} />
        <ProductPurchase product={product} />
      </section>
      {product.campaign ? (
        <section className="product-ambassador-story section-shell">
          <div className="product-ambassador-story__copy">
            <p className="eyebrow">Embajadora 01 / {product.campaign.scene}</p>
            <h2>Vista por Maite.</h2>
            <p>
              Esta escena presenta la intención de uso y silueta de la pieza.
              Es dirección de arte conceptual: la prenda definitiva se ajustará
              después de validar materiales, calce y confección.
            </p>
          </div>
          <figure>
            <Image
              src={product.campaign.image}
              alt={product.campaign.alt}
              fill
              sizes="(max-width: 820px) 100vw, 55vw"
            />
          </figure>
        </section>
      ) : null}
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
        <div
          className={`product-grid product-grid--related ${related.length === 1 ? "product-grid--single" : ""}`}
        >
          {related.map((item) => (
            <ProductCard product={item} key={item.slug} />
          ))}
        </div>
      </section>
    </main>
  );
}
