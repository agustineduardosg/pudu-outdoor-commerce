import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { brandedProducts, getBrandedProduct } from "@/data/products";

export const metadata: Metadata = {
  title: "Colección Mujer — Maite, Embajadora 01",
  description:
    "Conoce la primera cápsula outdoor femenina de PUDU junto a Maite: Softshell Austral, Polar Lenga y piezas conceptuales próximas a lanzamiento.",
};

const softshell = getBrandedProduct("shell-ventisquero")!;
const polar = getBrandedProduct("polar-coihue")!;

export default function CollectionPage() {
  return (
    <main id="contenido" tabIndex={-1} className="page-shell collection-page">
      <section className="collection-launch" aria-labelledby="collection-title">
        <div className="collection-launch__copy">
          <p className="eyebrow">PUDU Mujer / Cápsula 01</p>
          <h1 id="collection-title">
            Maite abre
            <br />
            el camino.
          </h1>
          <p className="collection-launch__lead">
            Nuestra primera embajadora presenta dos piezas esenciales entre la
            cordillera y el refugio. Una colección en desarrollo, pensada para
            acompañar el movimiento cotidiano sin exceso.
          </p>
          <div className="collection-launch__actions">
            <Link className="button button--dark" href="#looks-maite">
              Ver looks de Maite
              <ArrowDownRight aria-hidden="true" size={17} />
            </Link>
            <Link className="text-link" href="#catalogo-mujer">
              Explorar catálogo
            </Link>
          </div>
          <div className="collection-launch__status" aria-label="Estado de la colección">
            <span>01</span>
            <p>
              <strong>Próximamente</strong>
              Prendas conceptuales en validación de materiales y confección.
            </p>
          </div>
        </div>

        <figure className="collection-launch__portrait">
          <Image
            src="/images/maite/maite-softshell-austral-snow.avif"
            alt="Maite, primera embajadora PUDU, viste la Softshell Austral en la cordillera"
            fill
            loading="eager"
            fetchPriority="high"
            quality={55}
            sizes="(max-width: 820px) 100vw, 52vw"
          />
          <figcaption>
            <span>Embajadora 01</span>
            <strong>Maite</strong>
            <span>Cordillera de los Andes</span>
          </figcaption>
        </figure>
      </section>

      <section className="ambassador-note" aria-label="Presentación de Maite">
        <p className="eyebrow">La mirada PUDU</p>
        <blockquote>
          Una presencia cercana, natural y activa. Maite representa una forma
          de explorar que comienza mucho antes de llegar al sendero.
        </blockquote>
        <p>
          Las imágenes de esta campaña son material conceptual de dirección de
          arte. Las prendas finales pueden presentar ajustes tras su validación.
        </p>
      </section>

      <section id="looks-maite" className="maite-looks" aria-labelledby="looks-title">
        <header className="section-heading maite-looks__heading">
          <div>
            <p className="eyebrow">Embajadora 01 / Dos ambientes</p>
            <h2 id="looks-title">Del frío al refugio.</h2>
          </div>
          <p>
            Dos escenas para entender la colección como un sistema: protección
            exterior cuando cambia el clima y abrigo sereno al bajar el ritmo.
          </p>
        </header>

        <div className="maite-looks__grid">
          <article className="maite-look maite-look--snow">
            <Link href={`/producto/${softshell.slug}`} className="maite-look__media">
              <Image
                src={softshell.campaign!.image}
                alt={softshell.campaign!.alt}
                fill
                quality={55}
                sizes="(max-width: 820px) 100vw, 58vw"
              />
            </Link>
            <div className="maite-look__body">
              <span>Look 01 / Cordillera</span>
              <h3>{softshell.name}</h3>
              <p>{softshell.description}</p>
              <Link href={`/producto/${softshell.slug}`}>
                Ver pieza <ArrowUpRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </article>

          <article className="maite-look maite-look--cabin">
            <Link href={`/producto/${polar.slug}`} className="maite-look__media">
              <Image
                src={polar.campaign!.image}
                alt={polar.campaign!.alt}
                fill
                quality={55}
                sizes="(max-width: 820px) 100vw, 42vw"
              />
            </Link>
            <div className="maite-look__body">
              <span>Look 02 / Refugio</span>
              <h3>{polar.name}</h3>
              <p>{polar.description}</p>
              <Link href={`/producto/${polar.slug}`}>
                Ver pieza <ArrowUpRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section id="catalogo-mujer" className="collection-catalog" aria-labelledby="catalog-title">
        <header className="collection-catalog__header">
          <div>
            <p className="eyebrow">Colección Mujer / Cápsula 01</p>
            <h2 id="catalog-title">Dos firmas PUDU.</h2>
          </div>
          <p>
            Precios referenciales para validar la propuesta. Disponibilidad,
            composición y desempeño se publicarán después de las pruebas de
            producto.
          </p>
        </header>
        <div className="collection-filter" aria-label="Información de colección">
          <span>Catálogo conceptual</span>
          <span>{brandedProducts.length} piezas / Próximamente</span>
        </div>
        <div className="product-grid product-grid--branded">
          {brandedProducts.map((product, index) => (
            <ProductCard
              product={product}
              headingLevel={2}
              priority={index < 2}
              key={product.slug}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
